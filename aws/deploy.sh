#!/bin/bash

# Expense Tracker AWS Deployment Script

set -e

# Configuration
APP_NAME="expense-tracker"
STACK_NAME="${APP_NAME}-stack"
REGION="us-east-1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment of Expense Tracker...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Deploying CloudFormation stack...${NC}"

# Deploy CloudFormation stack
aws cloudformation deploy \
    --template-file cloudformation.yaml \
    --stack-name $STACK_NAME \
    --parameter-overrides AppName=$APP_NAME \
    --capabilities CAPABILITY_NAMED_IAM \
    --region $REGION

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CloudFormation stack deployed successfully!${NC}"
else
    echo -e "${RED}❌ CloudFormation deployment failed!${NC}"
    exit 1
fi

# Get stack outputs
echo -e "${YELLOW}📊 Getting stack outputs...${NC}"

S3_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
    --output text)

WEBSITE_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' \
    --output text)

DYNAMODB_TABLE=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`DynamoDBTableName`].OutputValue' \
    --output text)

IDENTITY_POOL_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`IdentityPoolId`].OutputValue' \
    --output text)

echo -e "${GREEN}📝 Stack outputs:${NC}"
echo -e "  S3 Bucket: ${S3_BUCKET}"
echo -e "  Website URL: ${WEBSITE_URL}"
echo -e "  DynamoDB Table: ${DYNAMODB_TABLE}"
echo -e "  Identity Pool ID: ${IDENTITY_POOL_ID}"

# Create environment file
echo -e "${YELLOW}🔧 Creating environment configuration...${NC}"

cat > ../.env.production << EOF
REACT_APP_AWS_REGION=${REGION}
REACT_APP_DYNAMODB_TABLE=${DYNAMODB_TABLE}
REACT_APP_IDENTITY_POOL_ID=${IDENTITY_POOL_ID}
EOF

echo -e "${GREEN}✅ Environment file created: .env.production${NC}"

# Build the React app
echo -e "${YELLOW}🏗️  Building React application...${NC}"
cd ..
npm install
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ React app built successfully!${NC}"
else
    echo -e "${RED}❌ React build failed!${NC}"
    exit 1
fi

# Deploy to S3
echo -e "${YELLOW}📤 Deploying to S3...${NC}"
aws s3 sync dist/ s3://$S3_BUCKET --delete --region $REGION

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files uploaded to S3 successfully!${NC}"
else
    echo -e "${RED}❌ S3 upload failed!${NC}"
    exit 1
fi

# Invalidate CloudFront cache
echo -e "${YELLOW}🔄 Invalidating CloudFront cache...${NC}"
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Origins.Items[0].DomainName=='${S3_BUCKET}.s3.amazonaws.com'].Id" \
    --output text \
    --region $REGION)

if [ ! -z "$DISTRIBUTION_ID" ]; then
    aws cloudfront create-invalidation \
        --distribution-id $DISTRIBUTION_ID \
        --paths "/*" \
        --region $REGION > /dev/null
    echo -e "${GREEN}✅ CloudFront cache invalidated!${NC}"
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your app is available at: ${WEBSITE_URL}${NC}"
echo -e "${YELLOW}📝 Note: CloudFront distribution may take 10-15 minutes to fully deploy.${NC}"