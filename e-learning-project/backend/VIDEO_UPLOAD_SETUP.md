# AWS S3 Video Upload Setup Guide

This guide explains how to set up AWS S3 video upload functionality for the e-learning platform.

## Prerequisites

1. AWS Account with S3 access
2. S3 bucket created for video storage
3. AWS IAM user with S3 permissions

## Configuration Steps

### 1. Create S3 Bucket

1. Go to AWS S3 Console
2. Create a new bucket (e.g., `your-elearning-videos`)
3. Choose your preferred region
4. Configure bucket settings as needed

### 2. Create IAM User

1. Go to AWS IAM Console
2. Create a new user for video uploads
3. Attach the following policy:

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
            "Resource": "arn:aws:s3:::your-elearning-videos/*"
        }
    ]
}
```

### 3. Get Access Keys

1. Create access keys for the IAM user
2. Copy the Access Key ID and Secret Access Key

### 4. Update Environment Variables

Edit the `.env` file in the backend directory:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_actual_access_key_here
AWS_SECRET_ACCESS_KEY=your_actual_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-elearning-videos
```

### 5. Install Dependencies

The required packages are already installed:
- `aws-sdk` - AWS SDK for Node.js
- `fluent-ffmpeg` - Video processing library
- `multer` - File upload middleware
- `uuid` - Unique ID generation

## How It Works

### Frontend (admincourses.js)

1. User selects a video file
2. File is validated (size < 50MB, video type)
3. When adding module, video is uploaded to S3 via `/api/video/upload-video`
4. S3 response includes video URL, thumbnail, duration, etc.
5. Module is created with S3 video data

### Backend (VideoUpload.js)

1. Receives video file via multer
2. Generates video thumbnail using ffmpeg
3. Uploads video and thumbnail to S3
4. Returns video metadata including S3 URLs

## API Endpoints

- `POST /api/video/upload-video` - Upload video to S3
- `GET /api/video/video/:videoId` - Get video details
- `DELETE /api/video/video/:videoId` - Delete video from S3

## File Structure

```
uploads/
  temp/           # Temporary video storage
    video-*.mp4   # Uploaded videos
    thumb-*.jpg   # Generated thumbnails
```

## Security Features

- File size limit: 50MB
- File type validation: Only video files
- Authentication required for uploads
- Temporary file cleanup after S3 upload
- Public read access for uploaded videos

## Troubleshooting

### Common Issues

1. **AWS credentials error**: Check your .env file and IAM permissions
2. **File upload fails**: Verify file size and type
3. **Thumbnail generation fails**: Ensure ffmpeg is installed on the server
4. **CORS errors**: Check S3 bucket CORS configuration

### S3 Bucket CORS Configuration

Add this CORS configuration to your S3 bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
        "ExposeHeaders": []
    }
]
```

## Testing

1. Start the backend server
2. Open admincourses.js in the frontend
3. Try creating a course with video modules
4. Check S3 bucket for uploaded videos
5. Verify video URLs are accessible

## Cost Considerations

- S3 storage costs per GB
- Data transfer costs for video streaming
- Consider using CloudFront for global video delivery
- Implement video compression to reduce storage costs
