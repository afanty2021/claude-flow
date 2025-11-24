[根目录](../../CLAUDE.md) > [src](../) > **mcp**

# MCP服务器模块 (src/mcp)

## 模块架构与职责

MCP (Model Context Protocol) 服务器模块是 Claude-Flow 的核心外部接口，提供了标准化的协议服务，支持与 Claude Code、Flow-Nexus 和其他 MCP 客户端的集成。该模块实现了完整的 MCP 协议栈，包括工具注册、资源管理、提示系统等功能。

### MCP 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP 服务器架构                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   MCPServer     │  │   MCPConfig     │  │   MCPUtils      │ │
│  │   (服务器核心)   │  │   (配置管理)     │  │   (工具集)       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  MCPAgent       │  │ MCPDevelopment  │  │ MCPTesting      │ │
│  │  (代理工具)      │  │ (开发工具)       │  │ (测试工具)       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ FlowNexusAuth   │  │ MCPClient       │  │ MCPDebug        │ │
│  │ (Flow-Nexus认证) │  │ (客户端管理)     │  │ (调试工具)       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 主要组件和接口

### 1. MCPServer - MCP 服务器核心

**职责**: 实现 MCP 协议规范，提供标准化的工具、资源和提示管理服务。

**核心功能**:
- **协议实现**: 完整的 MCP v2024-11-05 协议支持
- **工具管理**: 动态工具注册、调用和管理
- **资源管理**: 文件和数据处理资源的暴露
- **提示管理**: AI 提示模板和参数管理
- **安全认证**: 基于令牌的安全访问控制

**关键接口**:
```typescript
interface MCPServer {
  // 生命周期管理
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  shutdown(): Promise<void>;

  // 工具管理
  registerTool(tool: MCPTool): void;
  unregisterTool(toolName: string): void;
  callTool(name: string, args: any): Promise<any>;

  // 资源管理
  registerResource(resource: MCPResource): void;
  unregisterResource(uri: string): void;
  readResource(uri: string): Promise<ReadResourceResult>;

  // 提示管理
  registerPrompt(prompt: MCPPrompt): void;
  getPrompt(name: string, args?: any): Promise<GetPromptResult>;

  // 认证管理
  authenticate(credentials: AuthCredentials): Promise<AuthResult>;
  validateToken(token: string): Promise<boolean>;

  // 状态查询
  getServerInfo(): ServerCapabilities;
  getHealthStatus(): Promise<HealthStatus>;
}
```

**配置示例**:
```typescript
const mcpServerConfig: MCPConfig = {
  name: 'claude-flow-server',
  version: '1.0.0',
  protocolVersion: '2024-11-05',

  capabilities: {
    tools: {
      listChanged: true,
      list: true,
      call: true
    },
    resources: {
      subscribe: true,
      list: true,
      read: true
    },
    prompts: {
      list: true,
      get: true
    },
    logging: {
      level: 'info'
    }
  },

  security: {
    authentication: {
      enabled: true,
      type: 'token',
      secretKey: process.env.JWT_SECRET
    },
    authorization: {
      enabled: true,
      policies: ['read', 'write', 'execute']
    },
    rateLimiting: {
      enabled: true,
      maxRequests: 100,
      windowMs: 60000
    }
  },

  performance: {
    maxConcurrentRequests: 50,
    requestTimeout: 30000,
    enableMetrics: true
  }
};
```

### 2. MCPTool - MCP 工具系统

**职责**: 定义和管理可被外部客户端调用的工具和功能。

**工具类型**:
```typescript
// 基础工具接口
interface MCPTool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  handler: ToolHandler;
  permissions?: string[];
  rateLimit?: RateLimit;
  validation?: ValidationSchema;
}

// 工具处理器类型
type ToolHandler = (args: any, context: RequestContext) => Promise<any>;
```

**内置工具类别**:

**1. 开发工具**
```typescript
// 项目管理工具
const projectTools: MCPTool[] = [
  {
    name: 'claude_flow_list_modes',
    description: 'List available SPARC execution modes',
    inputSchema: {
      type: 'object',
      properties: {}
    },
    handler: async () => {
      return {
        modes: ['spec-pseudocode', 'architect', 'refinement', 'integration'],
        description: 'Available SPARC methodology execution modes'
      };
    }
  },

  {
    name: 'claude_flow_run_mode',
    description: 'Execute specific SPARC mode',
    inputSchema: {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['spec-pseudocode', 'architect', 'refinement', 'integration'] },
        task: { type: 'string' }
      },
      required: ['mode', 'task']
    },
    handler: async (args, context) => {
      return await this.sparcCoordinator.runMode(args.mode, args.task);
    }
  }
];
```

**2. 批处理工具**
```typescript
const batchTools: MCPTool[] = [
  {
    name: 'claude_flow_batch_execute',
    description: 'Execute batch SPARC processes',
    inputSchema: {
      type: 'object',
      properties: {
        modes: { type: 'array', items: { type: 'string' } },
        task: { type: 'string' }
      },
      required: ['modes', 'task']
    },
    handler: async (args, context) => {
      return await this.sparcCoordinator.executeBatch(args.modes, args.task);
    }
  }
];
```

### 3. MCPResource - 资源管理系统

**职责**: 管理和暴露文件、数据和其他资源给外部客户端访问。

**资源类型**:
```typescript
interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  metadata?: Record<string, any>;
  accessControl?: AccessPolicy;
}

// 资源访问结果
interface ReadResourceResult {
  contents: {
    uri: string;
    mimeType: string;
    text?: string;
    blob?: Buffer;
  }[];
}
```

**内置资源类型**:

**1. 文件系统资源**
```typescript
const fileSystemResources: MCPResource[] = [
  {
    uri: 'file://src/README.md',
    name: 'Source Documentation',
    description: 'Main source code documentation',
    mimeType: 'text/markdown',
    accessControl: {
      permissions: ['read'],
      authentication: true
    }
  },

  {
    uri: 'file://config/swarm.json',
    name: 'Swarm Configuration',
    description: 'Swarm system configuration file',
    mimeType: 'application/json',
    accessControl: {
      permissions: ['read'],
      authentication: true
    }
  }
];
```

**2. 系统状态资源**
```typescript
const systemResources: MCPResource[] = [
  {
    uri: 'system://status',
    name: 'System Status',
    description: 'Current system status and health information',
    mimeType: 'application/json'
  },

  {
    uri: 'system://metrics',
    name: 'System Metrics',
    description: 'Real-time system performance metrics',
    mimeType: 'application/json'
  }
];
```

### 4. MCPPrompt - 提示管理系统

**职责**: 管理和提供 AI 提示模板，支持参数化和动态生成。

**提示类型**:
```typescript
interface MCPPrompt {
  name: string;
  description: string;
  arguments: PromptArgument[];
  handler: PromptHandler;
}

interface PromptArgument {
  name: string;
  description: string;
  required?: boolean;
  type?: string;
  default?: any;
}

type PromptHandler = (args: Record<string, any>, context: RequestContext) => Promise<PromptResult>;

interface PromptResult {
  messages: {
    role: 'user' | 'assistant' | 'system';
    content: {
      type: 'text' | 'image';
      text?: string;
      data?: string;
      mimeType?: string;
    };
  }[];
}
```

**内置提示模板**:

**1. SPARC 方法论提示**
```typescript
const sparcPrompts: MCPPrompt[] = [
  {
    name: 'sparc_specification',
    description: 'Generate SPARC specification phase prompt',
    arguments: [
      {
        name: 'requirement',
        description: 'Project requirement description',
        required: true,
        type: 'string'
      }
    ],
    handler: async (args, context) => {
      return {
        messages: [
          {
            role: 'system',
            content: {
              type: 'text',
              text: 'You are a SPARC methodology expert. Generate comprehensive specifications.'
            }
          },
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Analyze and generate specifications for: ${args.requirement}`
            }
          }
        ]
      };
    }
  }
];
```

### 5. FlowNexusAuth - Flow-Nexus 认证系统

**职责**: 提供 Flow-Nexus 云平台的集成认证服务。

**核心功能**:
- **用户注册**: Flow-Nexus 平台用户注册
- **身份验证**: 基于令牌的身份验证
- **权限管理**: 基于角色的访问控制
- **会话管理**: 用户会话生命周期管理

**认证流程**:
```typescript
class FlowNexusAuth {
  // 用户注册
  async registerUser(userData: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<AuthResult> {
    try {
      // 1. 验证用户数据
      await this.validateUserData(userData);

      // 2. 检查用户是否存在
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // 3. 哈希密码
      const hashedPassword = await this.hashPassword(userData.password);

      // 4. 创建用户
      const user = await this.userRepository.create({
        ...userData,
        password: hashedPassword,
        createdAt: new Date()
      });

      // 5. 生成访问令牌
      const accessToken = this.generateToken(user);

      return {
        success: true,
        user: this.sanitizeUser(user),
        accessToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 身份验证
  async authenticateUser(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await this.verifyPassword(credentials.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const accessToken = this.generateToken(user);
    return {
      success: true,
      user: this.sanitizeUser(user),
      accessToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  }
}
```

### 6. MCPClient - 客户端管理

**职责**: 管理连接到 MCP 服务器的客户端会话和连接。

**核心功能**:
- **连接管理**: 客户端连接的建立和维护
- **会话管理**: 用户会话的创建和清理
- **权限验证**: 客户端权限的实时验证
- **通信路由**: 消息路由和响应处理

## 开发规范和最佳实践

### 1. 工具开发规范

```typescript
// 标准工具开发模板
abstract class BaseMCPTool implements MCPTool {
  abstract name: string;
  abstract description: string;
  abstract inputSchema: JSONSchema;

  protected abstract executeCore(
    args: any,
    context: RequestContext
  ): Promise<any>;

  async handler(
    args: any,
    context: RequestContext
  ): Promise<any> {
    // 1. 输入验证
    await this.validateInput(args);

    // 2. 权限检查
    await this.checkPermissions(context);

    // 3. 执行核心逻辑
    const result = await this.executeCore(args, context);

    // 4. 结果处理
    return this.processResult(result);
  }

  protected async validateInput(args: any): Promise<void> {
    const ajv = new Ajv();
    const validate = ajv.compile(this.inputSchema);

    if (!validate(args)) {
      throw new ValidationError('Invalid input', validate.errors);
    }
  }

  protected async checkPermissions(context: RequestContext): Promise<void> {
    if (!context.hasPermission('execute')) {
      throw new AuthorizationError('Insufficient permissions');
    }
  }

  protected processResult(result: any): any {
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };
  }
}
```

### 2. 错误处理策略

```typescript
// 标准错误处理
class MCPErrorHandler {
  static handleToolError(error: Error, toolName: string): any {
    const errorCode = this.getErrorCode(error);

    return {
      success: false,
      error: {
        code: errorCode,
        message: error.message,
        tool: toolName,
        timestamp: new Date().toISOString()
      }
    };
  }

  private static getErrorCode(error: Error): string {
    if (error instanceof ValidationError) return 'VALIDATION_ERROR';
    if (error instanceof AuthorizationError) return 'AUTHORIZATION_ERROR';
    if (error instanceof ResourceNotFoundError) return 'RESOURCE_NOT_FOUND';
    return 'INTERNAL_ERROR';
  }
}
```

### 3. 安全最佳实践

```typescript
// 安全中间件
class SecurityMiddleware {
  // 请求限流
  static rateLimitMiddleware = (
    request: MCPRequest,
    next: () => Promise<any>
  ): Promise<any> => {
    const clientId = request.clientId;
    const limit = this.rateLimiter.getLimit(clientId);

    if (limit.exceeded) {
      throw new RateLimitError('Rate limit exceeded');
    }

    limit.increment();
    return next();
  };

  // 权限检查
  static authorizationMiddleware = (
    request: MCPRequest,
    requiredPermission: string,
    next: () => Promise<any>
  ): Promise<any> => {
    const user = request.user;

    if (!user || !user.hasPermission(requiredPermission)) {
      throw new AuthorizationError(`Permission ${requiredPermission} required`);
    }

    return next();
  };

  // 日志记录
  static loggingMiddleware = async (
    request: MCPRequest,
    next: () => Promise<any>
  ): Promise<any> => {
    const startTime = Date.now();

    try {
      const result = await next();

      await this.logRequest(request, {
        status: 'success',
        duration: Date.now() - startTime,
        resultSize: JSON.stringify(result).length
      });

      return result;
    } catch (error) {
      await this.logRequest(request, {
        status: 'error',
        duration: Date.now() - startTime,
        error: error.message
      });

      throw error;
    }
  };
}
```

### 4. 性能优化模式

```typescript
// 缓存机制
class MCPResourceCache {
  private cache = new LRUCache<string, CachedResource>(1000);

  async getResource(uri: string): Promise<ReadResourceResult> {
    const cached = this.cache.get(uri);

    if (cached && !this.isExpired(cached)) {
      return cached.result;
    }

    const result = await this.loadResource(uri);
    this.cache.set(uri, {
      result,
      timestamp: Date.now(),
      ttl: this.getTTL(uri)
    });

    return result;
  }

  private isExpired(cached: CachedResource): boolean {
    return Date.now() - cached.timestamp > cached.ttl;
  }
}

// 批量操作优化
class BatchProcessor {
  private batchQueue: MCPRequest[] = [];
  private processing = false;

  async addToBatch(request: MCPRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({
        ...request,
        resolve,
        reject
      });

      if (!this.processing) {
        this.processBatch();
      }
    });
  }

  private async processBatch(): Promise<void> {
    this.processing = true;

    try {
      while (this.batchQueue.length > 0) {
        const batch = this.batchQueue.splice(0, 10); // 每批处理10个请求

        await Promise.allSettled(
          batch.map(request => this.processSingleRequest(request))
        );
      }
    } finally {
      this.processing = false;
    }
  }
}
```

## 与其他模块的集成

### 1. 与 Core 模块集成

```typescript
// 核心系统集成
class MCPCoreIntegration {
  async initializeCoreServices(): Promise<void> {
    // 注入核心服务
    this.mcpServer.setOrchestrator(this.orchestrator);
    this.mcpServer.setEventBus(this.eventBus);

    // 注册核心工具
    this.registerCoreTools();
  }

  private registerCoreTools(): void {
    // 编排器工具
    this.mcpServer.registerTool({
      name: 'orchestrator_spawn_agent',
      description: 'Spawn new agent via orchestrator',
      inputSchema: {
        type: 'object',
        properties: {
          profile: { type: 'object' }
        }
      },
      handler: async (args, context) => {
        return await this.orchestrator.spawnAgent(args.profile);
      }
    });

    // 事件总线工具
    this.mcpServer.registerTool({
      name: 'event_bus_emit',
      description: 'Emit event to event bus',
      inputSchema: {
        type: 'object',
        properties: {
          event: { type: 'string' },
          data: { type: 'any' }
        }
      },
      handler: async (args, context) => {
        this.eventBus.emit(args.event, args.data);
        return { success: true };
      }
    });
  }
}
```

### 2. 与 Swarm 模块集成

```typescript
// Swarm 工具集成
class MCPSwarmIntegration {
  registerSwarmTools(): void {
    // Swarm 管理工具
    this.mcpServer.registerTool({
      name: 'swarm_create_objective',
      description: 'Create new swarm objective',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          strategy: {
            enum: ['auto', 'research', 'development', 'testing', 'analysis', 'optimization']
          }
        },
        required: ['name', 'description']
      },
      handler: async (args, context) => {
        return await this.swarmCoordinator.createObjective(
          args.name,
          args.description,
          args.strategy
        );
      }
    });

    // 代理注册工具
    this.mcpServer.registerTool({
      name: 'swarm_register_agent',
      description: 'Register new agent in swarm',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          capabilities: { type: 'object' }
        },
        required: ['name', 'type']
      },
      handler: async (args, context) => {
        return await this.swarmCoordinator.registerAgent(
          args.name,
          args.type as AgentType,
          args.capabilities
        );
      }
    });
  }
}
```

### 3. 与 Verification 模块集成

```typescript
// 验证系统集成
class MCPVerificationIntegration {
  registerVerificationTools(): void {
    // 验证请求工具
    this.mcpServer.registerTool({
      name: 'verification_submit_claim',
      description: 'Submit truth claim for verification',
      inputSchema: {
        type: 'object',
        properties: {
          agentId: { type: 'string' },
          claim: { type: 'any' },
          evidence: { type: 'array' }
        },
        required: ['agentId', 'claim']
      },
      handler: async (args, context) => {
        const verification = await this.verificationSystem.verify(
          args.agentId,
          args.claim,
          args.evidence || []
        );

        return {
          verified: verification.verified,
          confidence: verification.confidence,
          timestamp: verification.timestamp
        };
      }
    });

    // 安全状态工具
    this.mcpServer.registerTool({
      name: 'verification_security_status',
      description: 'Get security and verification status',
      inputSchema: {
        type: 'object',
        properties: {}
      },
      handler: async (args, context) => {
        return this.verificationSystem.getSecurityStatus();
      }
    });
  }
}
```

### 4. 与 Coordination 模块集成

```typescript
// 协调系统集成
class MCPCoordinationIntegration {
  registerCoordinationTools(): void {
    // 任务分配工具
    this.mcpServer.registerTool({
      name: 'coordination_assign_task',
      description: 'Assign task to specific agent',
      inputSchema: {
        type: 'object',
        properties: {
          task: { type: 'object' },
          agentId: { type: 'string' }
        },
        required: ['task', 'agentId']
      },
      handler: async (args, context) => {
        await this.coordinationManager.assignTask(args.task, args.agentId);
        return { success: true };
      }
    });

    // 资源管理工具
    this.mcpServer.registerTool({
      name: 'coordination_acquire_resource',
      description: 'Acquire system resource',
      inputSchema: {
        type: 'object',
        properties: {
          resourceId: { type: 'string' },
          agentId: { type: 'string' }
        },
        required: ['resourceId', 'agentId']
      },
      handler: async (args, context) => {
        await this.coordinationManager.acquireResource(
          args.resourceId,
          args.agentId
        );
        return { success: true };
      }
    });
  }
}
```

## 配置和使用示例

### 1. 基础 MCP 服务器配置

```json
{
  "mcp": {
    "server": {
      "name": "claude-flow-mcp-server",
      "version": "1.0.0",
      "protocolVersion": "2024-11-05"
    },
    "capabilities": {
      "tools": {
        "list": true,
        "call": true,
        "listChanged": true
      },
      "resources": {
        "subscribe": true,
        "list": true,
        "read": true
      },
      "prompts": {
        "list": true,
        "get": true
      }
    },
    "security": {
      "authentication": {
        "enabled": true,
        "type": "jwt",
        "secretKey": "${JWT_SECRET}"
      },
      "authorization": {
        "enabled": true,
        "policies": ["read", "write", "execute", "admin"]
      },
      "rateLimiting": {
        "enabled": true,
        "maxRequests": 100,
        "windowMs": 60000
      }
    },
    "performance": {
      "maxConcurrentRequests": 50,
      "requestTimeout": 30000,
      "enableMetrics": true,
      "enableCaching": true
    }
  }
}
```

### 2. 启动和配置 MCP 服务器

```typescript
import { MCPServer } from './mcp/index.js';

async function startMCPServer() {
  // 1. 创建 MCP 服务器
  const mcpServer = new MCPServer(
    config.mcp,
    eventBus,
    logger,
    orchestrator
  );

  // 2. 注册内置工具
  await registerBuiltinTools(mcpServer);

  // 3. 注册核心服务集成
  await integrateCoreServices(mcpServer);

  // 4. 启动服务器
  await mcpServer.start();

  console.log('✅ MCP 服务器启动成功');
  console.log(`📋 可用工具: ${mcpServer.getRegisteredTools().length}`);
  console.log(`📁 可用资源: ${mcpServer.getRegisteredResources().length}`);
  console.log(`💬 可用提示: ${mcpServer.getRegisteredPrompts().length}`);
}

async function registerBuiltinTools(server: MCPServer): Promise<void> {
  // 注册开发工具
  server.registerBatch(...new MCPDevelopment());

  // 注册测试工具
  server.registerBatch(...new MCPTesting());

  // 注册代理工具
  server.registerBatch(...new MCPAgent());

  // 注册调试工具
  server.registerBatch(...new MCPDebug());

  // 注册 Flow-Nexus 认证
  server.registerBatch(...new FlowNexusAuth());
}
```

### 3. 客户端连接示例

```typescript
// Claude Code 客户端连接
import { MCPClient } from '@anthropic-ai/mcp-client';

async function connectToClaudeFlow() {
  const client = new MCPClient({
    serverUrl: 'ws://localhost:8080/mcp',
    authToken: process.env.CLAUDE_FLOW_TOKEN,
    protocolVersion: '2024-11-05'
  });

  await client.connect();

  // 获取可用工具
  const tools = await client.listTools();
  console.log('可用工具:', tools.tools.map(t => t.name));

  // 调用工具
  const result = await client.callTool('claude_flow_list_modes', {});
  console.log('SPARC 模式:', result.modes);

  // 获取资源
  const configResource = await client.readResource('file://config/swarm.json');
  console.log('Swarm 配置:', JSON.parse(configResource.contents[0].text));

  await client.disconnect();
}
```

### 4. Flow-Nexus 云平台集成

```typescript
// Flow-Nexus 平台集成
async function integrateFlowNexus() {
  // 1. 用户注册
  const auth = new FlowNexusAuth();
  const registerResult = await auth.registerUser({
    username: 'developer',
    email: 'dev@example.com',
    password: 'securePassword123',
    role: 'developer'
  });

  if (registerResult.success) {
    console.log('✅ Flow-Nexus 用户注册成功');

    // 2. 使用访问令牌连接
    const client = new MCPClient({
      serverUrl: 'wss://flow-nexus.ruv.io/mcp',
      authToken: registerResult.accessToken
    });

    await client.connect();
    console.log('✅ Flow-Nexus 连接成功');

    // 3. 访问云服务
    const cloudTools = await client.listTools();
    console.log('云服务工具:', cloudTools.tools.length);
  }
}
```

## 性能优化建议

### 1. 连接管理优化

```typescript
// 连接池管理
class MCPConnectionPool {
  private connections = new Map<string, MCPConnection>();
  private maxConnections = 50;

  async getConnection(clientId: string): Promise<MCPConnection> {
    if (this.connections.size >= this.maxConnections) {
      await this.cleanupIdleConnections();
    }

    let connection = this.connections.get(clientId);
    if (!connection || connection.isClosed()) {
      connection = await this.createConnection(clientId);
      this.connections.set(clientId, connection);
    }

    return connection;
  }

  private async cleanupIdleConnections(): Promise<void> {
    const idleConnections = Array.from(this.connections.entries())
      .filter(([_, conn]) => conn.isIdle())
      .slice(0, 10); // 清理10个空闲连接

    for (const [clientId, conn] of idleConnections) {
      await conn.close();
      this.connections.delete(clientId);
    }
  }
}
```

### 2. 请求处理优化

```typescript
// 异步请求处理
class AsyncRequestProcessor {
  private requestQueue: MCPRequest[] = [];
  private workers: number = 4;

  async processRequests(): Promise<void> {
    const workers = Array.from({ length: this.workers }, () =>
      this.createWorker()
    );

    await Promise.all(workers);
  }

  private async createWorker(): Promise<void> {
    while (true) {
      const request = this.requestQueue.shift();
      if (!request) break;

      try {
        const result = await this.processRequest(request);
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
    }
  }
}
```

## 监控和诊断

### 1. 关键指标监控

```typescript
interface MCPServerMetrics {
  // 连接指标
  activeConnections: number;
  totalConnections: number;
  connectionErrors: number;

  // 请求指标
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;

  // 资源指标
  memoryUsage: number;
  cpuUsage: number;
  activeTools: number;
  cachedResources: number;

  // 安全指标
  authenticationAttempts: number;
  authorizationFailures: number;
  rateLimitViolations: number;
}
```

### 2. 健康检查

```typescript
class MCPHealthChecker {
  async performHealthCheck(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabaseConnection(),
      this.checkMemoryUsage(),
      this.checkDiskSpace(),
      this.checkAuthentication(),
      this.checkToolRegistration()
    ]);

    const results = checks.map(check =>
      check.status === 'fulfilled' ? check.value : { healthy: false, error: check.reason }
    );

    return {
      healthy: results.every(r => r.healthy),
      checks: results,
      timestamp: new Date()
    };
  }

  private async checkAuthentication(): Promise<{ healthy: boolean }> {
    try {
      const testToken = this.generateTestToken();
      const isValid = await this.authService.validateToken(testToken);
      return { healthy: isValid };
    } catch (error) {
      return { healthy: false, error };
    }
  }
}
```

## 故障排除指南

### 1. 常见问题诊断

**连接失败**
```bash
# 检查服务器状态
claude-flow mcp status

# 检查网络连接
telnet localhost 8080

# 查看详细日志
claude-flow logs --component mcp --level debug
```

**认证失败**
```typescript
// 诊断认证问题
async function diagnoseAuthIssue(token: string) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token 验证成功:', payload);
  } catch (error) {
    console.error('Token 验证失败:', error.message);
  }

  // 检查用户状态
  const user = await userRepository.findByToken(token);
  console.log('用户状态:', user ? '有效' : '无效');
}
```

### 2. 性能调优

```typescript
// 性能优化配置
const performanceConfig = {
  maxConcurrentRequests: Math.min(os.cpus().length * 4, 100),
  requestTimeout: 15000,
  enableMetrics: true,
  enableCaching: true,
  cacheMaxSize: 1000,
  cacheTTL: 300000, // 5分钟
  compressionEnabled: true
};
```

## 变更记录 (Changelog)

### v1.2.0 (2025-11-24)
- ✨ 新增: Flow-Nexus 云平台集成
- ✨ 新增: 批处理工具支持
- ✨ 新增: 性能指标收集
- 🔧 改进: 认证安全机制
- 🔧 改进: 错误处理和日志记录
- 🐛 修复: 连接泄漏问题
- 🐛 修复: 并发安全问题

### v1.1.0 (2025-10-15)
- ✨ 新增: 完整的 MCP v2024-11-05 协议支持
- ✨ 新增: 提示管理系统
- ✨ 新增: 资源订阅功能
- 🔧 改进: 工具注册和管理
- 📚 文档: 完善API文档

---

> MCP 模块是 Claude-Flow 与外部世界交互的主要桥梁，提供了标准化的协议接口支持各种客户端工具的集成。通过该模块，用户可以方便地使用 Claude Code、Flow-Nexus 和其他兼容的 MCP 客户端来访问和控制 Claude-Flow 的全部功能。在开发和自定义工具时，请遵循 MCP 协议规范，确保与现有工具生态的兼容性。