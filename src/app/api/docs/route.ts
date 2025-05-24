import { NextResponse } from 'next/server'

const API_VERSION = '1.0.0'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://rojgarskill.com'

const apiDocumentation = {
  openapi: '3.0.0',
  info: {
    title: 'RojgarSkill E-Learning Platform API',
    version: API_VERSION,
    description: 'Comprehensive API for the RojgarSkill e-learning platform',
    contact: {
      name: 'RojgarSkill Support',
      email: 'support@rojgarskill.com',
      url: 'https://rojgarskill.com/support'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: `${BASE_URL}/api`,
      description: 'Production server'
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      },
      SessionAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'next-auth.session-token'
      }
    },
    schemas: {
      Course: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          shortDescription: { type: 'string' },
          thumbnail: { type: 'string', format: 'uri' },
          price: { type: 'string' },
          discountPrice: { type: 'string', nullable: true },
          currency: { type: 'string', default: 'INR' },
          duration: { type: 'string' },
          level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          language: { type: 'string', default: 'English' },
          requirements: { type: 'array', items: { type: 'string' } },
          learningOutcomes: { type: 'array', items: { type: 'string' } },
          isPublished: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Module: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          order: { type: 'integer' },
          courseId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Lesson: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          content: { type: 'string' },
          videoUrl: { type: 'string', format: 'uri' },
          duration: { type: 'integer' },
          order: { type: 'integer' },
          type: { type: 'string', enum: ['video', 'text', 'quiz', 'assignment', 'live'] },
          isPreview: { type: 'boolean' },
          moduleId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          amount: { type: 'string' },
          currency: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'completed', 'failed', 'refunded'] },
          gateway: { type: 'string', enum: ['razorpay', 'cashfree'] },
          gatewayPaymentId: { type: 'string' },
          gatewayOrderId: { type: 'string' },
          courseId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      LiveClass: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          scheduledAt: { type: 'string', format: 'date-time' },
          duration: { type: 'integer' },
          platform: { type: 'string', enum: ['zoom', 'google-meet'] },
          meetingId: { type: 'string' },
          meetingPassword: { type: 'string' },
          joinUrl: { type: 'string', format: 'uri' },
          recordingUrl: { type: 'string', format: 'uri' },
          status: { type: 'string', enum: ['scheduled', 'live', 'ended', 'cancelled'] },
          courseId: { type: 'string', format: 'uuid' },
          instructorId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Certificate: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          certificateNumber: { type: 'string' },
          issuedAt: { type: 'string', format: 'date-time' },
          pdfUrl: { type: 'string', format: 'uri' },
          verificationHash: { type: 'string' },
          courseId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          code: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          message: { type: 'string' }
        }
      }
    }
  },
  paths: {
    '/courses': {
      get: {
        summary: 'Get all courses',
        description: 'Retrieve a list of all published courses',
        tags: ['Courses'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1 },
            description: 'Page number for pagination'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100 },
            description: 'Number of courses per page'
          },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by category'
          },
          {
            name: 'level',
            in: 'query',
            schema: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
            description: 'Filter by difficulty level'
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/Success' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            courses: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/Course' }
                            },
                            pagination: {
                              type: 'object',
                              properties: {
                                page: { type: 'integer' },
                                limit: { type: 'integer' },
                                total: { type: 'integer' },
                                totalPages: { type: 'integer' }
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new course',
        description: 'Create a new course (instructor/admin only)',
        tags: ['Courses'],
        security: [{ SessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'categoryId', 'level', 'price'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'string' },
                  level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                  categoryId: { type: 'string', format: 'uuid' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Course created successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/Success' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/Course' }
                      }
                    }
                  ]
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          '403': {
            description: 'Forbidden - insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/courses/{id}': {
      get: {
        summary: 'Get course by ID',
        description: 'Retrieve a specific course with its modules and lessons',
        tags: ['Courses'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Course ID'
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/Success' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          allOf: [
                            { $ref: '#/components/schemas/Course' },
                            {
                              type: 'object',
                              properties: {
                                modules: {
                                  type: 'array',
                                  items: {
                                    allOf: [
                                      { $ref: '#/components/schemas/Module' },
                                      {
                                        type: 'object',
                                        properties: {
                                          lessons: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Lesson' }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          '404': {
            description: 'Course not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/payments/create-order': {
      post: {
        summary: 'Create payment order',
        description: 'Create a payment order for course enrollment',
        tags: ['Payments'],
        security: [{ SessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['courseId', 'gateway'],
                properties: {
                  courseId: { type: 'string', format: 'uuid' },
                  gateway: { type: 'string', enum: ['razorpay', 'cashfree'] }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Payment order created successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/Success' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            orderId: { type: 'string' },
                            amount: { type: 'number' },
                            currency: { type: 'string' },
                            gateway: { type: 'string' }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },
    '/webhooks/razorpay': {
      post: {
        summary: 'Razorpay webhook',
        description: 'Handle Razorpay payment webhooks',
        tags: ['Webhooks'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  event: { type: 'string' },
                  payload: { type: 'object' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Webhook processed successfully'
          },
          '400': {
            description: 'Invalid webhook signature or data'
          }
        }
      }
    },
    '/webhooks/cashfree': {
      post: {
        summary: 'Cashfree webhook',
        description: 'Handle Cashfree payment webhooks',
        tags: ['Webhooks'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  data: { type: 'object' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Webhook processed successfully'
          },
          '400': {
            description: 'Invalid webhook signature or data'
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Courses',
      description: 'Course management operations'
    },
    {
      name: 'Payments',
      description: 'Payment processing operations'
    },
    {
      name: 'Live Classes',
      description: 'Live class scheduling and management'
    },
    {
      name: 'Certificates',
      description: 'Certificate generation and verification'
    },
    {
      name: 'Analytics',
      description: 'Analytics and reporting'
    },
    {
      name: 'Webhooks',
      description: 'External service webhooks'
    }
  ]
}

export async function GET() {
  return NextResponse.json(apiDocumentation, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, s-maxage=3600'
    }
  })
} 