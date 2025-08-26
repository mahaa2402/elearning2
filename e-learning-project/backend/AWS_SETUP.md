# AWS S3 Setup for Video Upload

## Quick Fix for Video Upload Issues

The video upload is not working because AWS S3 credentials are missing. Follow these steps:

### 1. Create a .env file in the backend directory

Create a file named `.env` in the `e-learning-project/backend/` directory with the following content:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://mahaashri:mahaashri%40123@e-learning-platform.wx1swy3.mongodb.net/elearning?retryWrites=true&w=majority

# Server Configuration
PORT=5000

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-elearning-videos-bucket-name
```

### 2. Get AWS Credentials

1. **Create an S3 bucket:**
   - Go to AWS S3 Console
   - Create a new bucket (e.g., `your-elearning-videos`)
   - Choose your preferred region
   - Note the bucket name

2. **Create an IAM user:**
   - Go to AWS IAM Console
   - Create a new user for video uploads
   - Attach this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

3. **Get access keys:**
   - Create access keys for the IAM user
   - Copy the Access Key ID and Secret Access Key

### 3. Update the .env file

Replace the placeholder values in your `.env` file:
- `your_aws_access_key_id_here` → Your actual Access Key ID
- `your_aws_secret_access_key_here` → Your actual Secret Access Key  
- `your-elearning-videos-bucket-name` → Your actual S3 bucket name
- `us-east-1` → Your preferred AWS region

### 4. Restart the backend server

After creating the `.env` file, restart your backend server for the changes to take effect.

### 5. Test video upload

1. Go to the admin courses page
2. Create a course (save it first)
3. Add a module with a video
4. The video should now upload to AWS S3 successfully

## What Was Fixed

1. **Frontend**: Updated `addModule` function to upload videos to S3 before adding modules
2. **Backend**: Updated VideoUpload route to handle temporary module IDs for new modules
3. **Flow**: Videos are now properly uploaded to S3 when adding new modules

## Troubleshooting

- **"AWS credentials not found"**: Check your `.env` file exists and has correct values
- **"Access denied"**: Verify IAM user has proper S3 permissions
- **"Bucket not found"**: Check bucket name and region in `.env` file
- **"CORS error"**: Add CORS configuration to your S3 bucket

## S3 Bucket CORS Configuration

Add this to your S3 bucket CORS settings:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:3000"],
        "ExposeHeaders": []
    }
]
```
