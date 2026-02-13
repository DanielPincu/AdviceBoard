import { OpenAPIV3 } from 'openapi-types'

export const swaggerSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'AdviceBoard API (Windows Vista Edition)',
    description: 'API documentation for AdviceBoard backend',
    version: '1.0.0',
  },

  servers: [
    {
      url: 'http://localhost:4000/api',
      description: 'Local development',
    },
    {
      url: 'https://adviceboard-backend.onrender.com/api',
      description: 'Production (Render)',
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },

    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '698da4852b8d89093e02c4ac' },
          username: { type: 'string', example: 'Daniel' },
          email: { type: 'string', example: 'daniel@example.com' },
        },
      },

      Reply: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          content: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          anonymous: { type: 'boolean' },
          _createdBy: {
            oneOf: [
              { type: 'string' },
              { $ref: '#/components/schemas/User' },
            ],
          },
          _isMine: { type: 'boolean' },
        },
      },

      Advice: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
          anonymous: { type: 'boolean' },
          _createdBy: {
            oneOf: [
              { type: 'string' },
              { $ref: '#/components/schemas/User' },
            ],
          },
          createdAt: { type: 'string', format: 'date-time' },
          replies: {
            type: 'array',
            items: { $ref: '#/components/schemas/Reply' },
          },
          _isMine: { type: 'boolean' },
        },
      },

      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'yo8ufo@gmail.com' },
          password: { type: 'string', example: 'RunTimeError' },
        },
        example: { email: "daniel@example.com", password: "RunTimeError" },
      },

      RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' },
        },
        example: { username: "Daniel", email: "daniel@example.com", password: "RunTimeError" },
      },

      CreateAdviceRequest: {
        type: 'object',
        required: ['title', 'content', 'anonymous'],
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          anonymous: { type: 'boolean' },
        },
        example: { title: "How to stay focused", content: "One step at a time.", anonymous: false },
      },

      UpdateAdviceRequest: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          anonymous: { type: 'boolean' },
        },
        example: { title: "Updated title", content: "Updated content", anonymous: true },
      },

      CreateReplyRequest: {
        type: 'object',
        required: ['content', 'anonymous'],
        properties: {
          content: { type: 'string' },
          anonymous: { type: 'boolean' },
        },
        example: { content: "Try restarting your PC.", anonymous: true },
      },

      UpdateReplyRequest: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          anonymous: { type: 'boolean' },
        },
        example: { content: "This worked for me.", anonymous: false },
      },
    },
  },

  paths: {
    '/user/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
              examples: {
                default: {
                  value: { username: "Daniel", email: "yo8ufo@gmail.com", password: "RunTimeError" }
                }
              }
            },
          },
        },
        responses: {
          201: { description: 'User created' },
        },
      },
    },

    '/user/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              examples: {
                default: {
                  value: { email: "yo8ufo@gmail.com", password: "RunTimeError" }
                }
              }
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { token: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },

    '/advices': {
      get: {
        tags: ['Advices'],
        summary: 'Get all advices',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of advices',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Advice' },
                },
              },
            },
          },
        },
      },

      post: {
        tags: ['Advices'],
        summary: 'Create advice',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateAdviceRequest' },
              examples: {
                default: {
                  value: { title: "How to stay focused", content: "One step at a time.", anonymous: false }
                }
              }
            },
          },
        },
        responses: {
          201: {
            description: 'Advice created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Advice' },
                example: {
                  _id: "698da4852b8d89093e02c4ac",
                  title: "How to stay focused",
                  content: "One step at a time.",
                  anonymous: false,
                  _createdBy: {
                    _id: "698da4852b8d89093e02c4ac",
                    username: "Daniel",
                    email: "daniel@example.com"
                  },
                  createdAt: "2024-06-01T12:00:00Z",
                  replies: [],
                  _isMine: true
                }
              },
            },
          },
        },
      },
    },

    '/advices/{id}': {
      get: {
        tags: ['Advices'],
        summary: 'Get advice by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Advice found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Advice' },
              },
            },
          },
        },
      },

      put: {
        tags: ['Advices'],
        summary: 'Update advice',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateAdviceRequest' },
              examples: {
                default: {
                  value: { title: "Updated title", content: "Updated content", anonymous: true }
                }
              }
            },
          },
        },
        responses: {
          200: {
            description: 'Advice updated',
            content: {
              'application/json': {
                example: {
                  _id: "698da4852b8d89093e02c4ac",
                  title: "Updated title",
                  content: "Updated content",
                  anonymous: true,
                  _createdBy: "698da4852b8d89093e02c4ac",
                  createdAt: "2024-06-01T12:00:00Z",
                  replies: [],
                  _isMine: true
                }
              }
            }
          },
        },
      },

      delete: {
        tags: ['Advices'],
        summary: 'Delete advice',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Advice deleted' },
        },
      },
    },

    '/advices/{id}/replies': {
      post: {
        tags: ['Replies'],
        summary: 'Add reply to advice',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateReplyRequest' },
              examples: {
                default: {
                  value: { content: "Try restarting your PC.", anonymous: true }
                }
              }
            },
          },
        },
        responses: {
          201: {
            description: 'Reply added',
            content: {
              'application/json': {
                example: {
                  _id: "7a8b9c0d1e2f3g4h5i6j7k8l",
                  content: "Try restarting your PC.",
                  createdAt: "2024-06-01T13:00:00Z",
                  anonymous: true,
                  _createdBy: "7a8b9c0d1e2f3g4h5i6j7k8l",
                  _isMine: true
                }
              }
            }
          },
        },
      },
    },

    '/advices/{adviceId}/replies/{replyId}': {
      put: {
        tags: ['Replies'],
        summary: 'Update reply',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'adviceId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'replyId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateReplyRequest' },
              examples: {
                default: {
                  value: { content: "This worked for me.", anonymous: false }
                }
              }
            },
          },
        },
        responses: {
          200: {
            description: 'Reply updated',
            content: {
              'application/json': {
                example: {
                  _id: "7a8b9c0d1e2f3g4h5i6j7k8l",
                  content: "This worked for me.",
                  createdAt: "2024-06-01T14:00:00Z",
                  anonymous: false,
                  _createdBy: {
                    _id: "698da4852b8d89093e02c4ac",
                    username: "Daniel",
                    email: "daniel@example.com"
                  },
                  _isMine: true
                }
              }
            }
          },
        },
      },

      delete: {
        tags: ['Replies'],
        summary: 'Delete reply',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'adviceId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'replyId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Reply deleted' },
        },
      },
    },
  },
}