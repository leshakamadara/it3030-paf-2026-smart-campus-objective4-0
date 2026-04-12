# Cloudinary Integration for Smart Campus Ticket System

## Overview
This document describes how to use the Cloudinary integration for managing images/attachments in the Smart Campus Ticket System.

## Setup

### 1. Cloudinary Configuration
Before using the image upload features, configure your Cloudinary credentials in `application.yaml`:

```yaml
cloudinary:
  cloud-name: your_cloud_name
  api-key: your_api_key
  api-secret: your_api_secret
  folder: smart-campus-tickets
```

You can also use environment variables:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### 2. Get Cloudinary Credentials
1. Sign up at https://cloudinary.com
2. Go to your Dashboard
3. Copy your Cloud Name, API Key, and API Secret

## API Endpoints

### 1. Create Ticket with Image
Upload a ticket with an image in a single request:

**Endpoint:** `POST /api/tickets/create`

**Headers:**
```
Content-Type: multipart/form-data
```

**Body (multipart):**
- `title` (string, required): Ticket title
- `category` (string, optional): Ticket category
- `description` (string, required): Ticket description
- `priority` (enum, required): LOW, MEDIUM, HIGH
- `imageFile` (file, optional): Image file to upload
- `attachmentLink` (string, optional): Legacy attachment URL

**Example (using curl):**
```bash
curl -X POST http://localhost:8082/api/tickets/create \
  -H "Content-Type: multipart/form-data" \
  -F "title=Projector Not Working" \
  -F "category=Hardware" \
  -F "description=The projector in Room 101 is not turning on" \
  -F "priority=HIGH" \
  -F "imageFile=@/path/to/image.jpg"
```

**Response:**
```json
{
  "id": 1,
  "title": "Projector Not Working",
  "category": "Hardware",
  "description": "The projector in Room 101 is not turning on",
  "priority": "HIGH",
  "status": "OPEN",
  "createdBy": "jane.smith@example.com",
  "technician": null,
  "attachments": [
    {
      "id": 1,
      "linkUrl": null,
      "cloudinaryPublicId": "smart-campus-tickets/ticket-1/1655789000_image.jpg",
      "cloudinaryUrl": "http://res.cloudinary.com/.../image.jpg",
      "cloudinarySecureUrl": "https://res.cloudinary.com/.../image.jpg",
      "cloudinarySize": 125472,
      "cloudinaryResourceType": "image",
      "createdAt": "2026-04-12T10:30:00"
    }
  ],
  "comments": []
}
```

### 2. Upload Image to Existing Ticket
Add an image to a ticket after creation:

**Endpoint:** `POST /api/tickets/{ticketId}/attachments/upload`

**Parameters:**
- `ticketId` (path): The ticket ID
- `file` (form): The image file to upload
- `userEmail` (query, optional): User email (default: guest@example.com)

**Example:**
```bash
curl -X POST http://localhost:8082/api/tickets/1/attachments/upload \
  -F "file=@/path/to/image.jpg" \
  -F "userEmail=jane.smith@example.com"
```

### 3. Delete Image from Ticket
Remove an image attachment from a ticket:

**Endpoint:** `DELETE /api/tickets/attachments/{attachmentId}`

**Parameters:**
- `attachmentId` (path): The attachment ID
- `userEmail` (query, optional): User email (default: guest@example.com)

**Example:**
```bash
curl -X DELETE http://localhost:8082/api/tickets/attachments/1 \
  -G --data-urlencode "userEmail=jane.smith@example.com"
```

**Response:**
```json
{
  "success": true,
  "message": "Attachment deleted successfully"
}
```

### 4. Delete Image from Ticket
Remove an image attachment from a ticket:

**Endpoint:** `DELETE /api/tickets/attachments/{attachmentId}`

**Parameters:**
- `attachmentId` (path): The attachment ID
- `userEmail` (query, optional): User email (default: guest@example.com)

**Example:**
```bash
curl -X DELETE http://localhost:8082/api/tickets/attachments/1 \
  -G --data-urlencode "userEmail=jane.smith@example.com"
```

**Response:**
```json
{
  "success": true,
  "message": "Attachment deleted successfully"
}
```

### 5. Get Ticket with All Attachments
Retrieve full ticket details including all attachments:

**Endpoint:** `GET /api/tickets/{id}/with-attachments`

**Example:**
```bash
curl http://localhost:8082/api/tickets/1/with-attachments
```

## Database Schema

The `ticket_attachments` table now includes:

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| link_url | VARCHAR(500) | Legacy URL field |
| cloudinary_public_id | VARCHAR(500) | Cloudinary public ID (unique identifier) |
| cloudinary_url | VARCHAR(1000) | HTTP URL of the image |
| cloudinary_secure_url | VARCHAR(1000) | HTTPS URL of the image |
| cloudinary_size | BIGINT | File size in bytes |
| cloudinary_resource_type | VARCHAR(100) | Resource type (image, video, etc.) |
| ticket_id | BIGINT | Foreign key to tickets table |
| created_at | TIMESTAMP | Creation timestamp |

## Client-Side Example (React/TypeScript)

```typescript
// Upload image when creating ticket
const createTicketWithImage = async (
  title: string,
  description: string,
  priority: string,
  imageFile?: File
) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('priority', priority);
  
  if (imageFile) {
    formData.append('imageFile', imageFile);
  }

  const response = await fetch('/api/tickets/create', {
    method: 'POST',
    body: formData
  });

  return response.json();
};

// Delete attachment
const deleteAttachment = async (attachmentId: number) => {
  const response = await fetch(
    `/api/tickets/attachments/${attachmentId}`,
    { method: 'DELETE' }
  );
  return response.json();
};
```

## File Size Limits

The application is configured with the following size limits in `application.yaml`:

```yaml
server:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
```

You can adjust these values if needed.

## Best Practices

1. **Error Handling**: Always validate file types and sizes on the client side before upload
2. **Security**: The Cloudinary public ID is encrypted and stored in the database
3. **File Organization**: Images are automatically organized in folders by ticket ID
4. **Monitoring**: Use Cloudinary dashboard to monitor storage usage and performance

## Supported File Types

- Images: JPG, PNG, GIF, WebP, SVG
- Videos: MP4, MOV, AVI, FLV, WMV (when resource_type is set to video)
- Documents: PDF, DOC, DOCX, XLS, XLSX (when resource_type is set to auto)

## Troubleshooting

### Image Not Uploading
- Check Cloudinary credentials in application.yaml
- Verify file size is under 10MB
- Ensure the file format is supported

### Cloudinary Dashboard
Monitor and manage all uploaded images at:
https://cloudinary.com/console/c-[your-cloud-name]/media_library

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Java SDK](https://github.com/cloudinary/cloudinary_java)
