# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Auth

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "walletAddress": "0x..." (optional)
}

Response: 201
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200
{
  "success": true,
  "token": "jwt_token",
  "user": { ... }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "user": { ... }
}
```

#### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "walletAddress": "0x..."
}

Response: 200
{
  "success": true,
  "user": { ... }
}
```

### Projects

#### Create Project
```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Mangrove Restoration Site A",
  "description": "Restoring 10,000 m² of mangrove forest",
  "ecosystemType": "Mangrove",
  "location": {
    "latitude": 10.123,
    "longitude": -75.456,
    "address": "Coastal Area"
  },
  "area": 10000,
  "images": ["url1", "url2"],
  "documents": ["url1"]
}

Response: 201
{
  "success": true,
  "project": { ... },
  "mrvCalculation": {
    "estimatedCarbonCredits": 65,
    "methodology": "Simplified Blue Carbon Standard",
    "factors": { ... }
  }
}
```

#### Get User's Projects
```http
GET /projects
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "count": 5,
  "projects": [ ... ]
}
```

#### Get All Projects (Verifiers Only)
```http
GET /projects/all?status=pending&ecosystemType=Mangrove
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "count": 10,
  "projects": [ ... ]
}
```

#### Get Project by ID
```http
GET /projects/:projectId
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "project": { ... }
}
```

#### Update Project Status (Verifiers Only)
```http
PUT /projects/:projectId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "verified",
  "estimatedCredits": 100,
  "blockchainTxHash": "0x..."
}

Response: 200
{
  "success": true,
  "project": { ... }
}
```

### Field Data

#### Submit Field Data
```http
POST /field-data
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "PROJ-xxx",
  "measurements": {
    "biomass": 1500,
    "carbonStock": 25,
    "treeCount": 150,
    "averageHeight": 3.5,
    "coveragePercentage": 75
  },
  "location": {
    "latitude": 10.123,
    "longitude": -75.456,
    "accuracy": 10
  },
  "images": {
    "before": ["url1", "url2"],
    "after": ["url3"],
    "progress": ["url4", "url5"]
  },
  "notes": "Field observations..."
}

Response: 201
{
  "success": true,
  "fieldData": { ... }
}
```

#### Get Field Data by Project
```http
GET /field-data/project/:projectId
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "count": 3,
  "fieldData": [ ... ]
}
```

#### Get Field Data by ID
```http
GET /field-data/:dataId
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "fieldData": { ... }
}
```

#### Get All Field Data (Verifiers Only)
```http
GET /field-data/all?verified=false
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "count": 8,
  "fieldData": [ ... ]
}
```

#### Verify Field Data (Verifiers Only)
```http
PUT /field-data/:dataId/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "approved": true,
  "blockchainTxHash": "0x..."
}

Response: 200
{
  "success": true,
  "fieldData": { ... }
}
```

## Data Models

### User
```typescript
{
  id: string;
  email: string;
  name: string;
  walletAddress?: string;
  role: 'user' | 'verifier' | 'admin';
  organization?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Project
```typescript
{
  projectId: string;
  userId: string;
  walletAddress: string;
  name: string;
  description: string;
  ecosystemType: 'Mangrove' | 'Seagrass' | 'Salt Marsh' | 'Other';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  area: number;
  ipfsHash: string;
  ipfsUrl: string;
  blockchainTxHash?: string;
  status: 'draft' | 'submitted' | 'pending' | 'verified' | 'rejected' | 'active' | 'completed';
  estimatedCredits?: number;
  issuedCredits: number;
  images: string[];
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Field Data
```typescript
{
  dataId: string;
  projectId: string;
  userId: string;
  collector: string;
  measurements: {
    biomass?: number;
    carbonStock?: number;
    treeCount?: number;
    averageHeight?: number;
    coveragePercentage?: number;
    soilDepth?: number;
    waterQuality?: number;
    biodiversityIndex?: number;
  };
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  images: {
    before: string[];
    after: string[];
    progress: string[];
  };
  ipfsHash: string;
  ipfsUrl: string;
  blockchainTxHash?: string;
  notes: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- Default: 100 requests per 15 minutes
- Configurable via environment variables
- Headers include rate limit info:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
