[根目录](../../CLAUDE.md) > [src](../) > **core**

# 核心系统模块 (src/core)

## 模块架构与职责

核心系统模块是 Claude-Flow 的中央神经系统，负责整个系统的编排、状态管理、事件通信和基础服务协调。该模块采用分层架构设计，确保系统的高可用性、可扩展性和容错性。

### 核心组件架构

```
┌─────────────────────────────────────────────────────────────┐
│                    核心系统架构                                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Orchestrator  │  │   EventBus      │  │ HiveMindCore    │ │
│  │   (系统编排器)    │  │   (事件总线)     │  │ (集体智能)       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ AgentRegistry   │  │ ConfigManager   │  │ MetricsCollector │ │
│  │ (代理注册中心)    │  │ (配置管理器)     │  │ (指标收集器)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ ConsensusEngine │  │ TopologyManager │  │ DatabaseManager  │ │
│  │ (共识引擎)       │  │ (拓扑管理器)     │  │ (数据库管理器)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 主要组件和接口

### 1. Orchestrator - 系统编排器

**职责**: 整个 Claude-Flow 系统的核心编排组件，负责代理生命周期管理、任务调度和系统协调。

**核心功能**:
- **代理管理**: 创建、启动、停止和监控代理实例
- **任务调度**: 智能任务分配和负载均衡
- **会话管理**: 代理会话的创建、持久化和恢复
- **健康监控**: 系统组件健康检查和自动恢复
- **并行执行**: 支持代理并行执行，性能提升 10-20x

**关键接口**:
```typescript
interface IOrchestrator {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  spawnAgent(profile: AgentProfile): Promise<string>;
  spawnParallelAgents(profiles: AgentProfile[]): Promise<Map<string, string>>;
  assignTask(task: Task): Promise<void>;
  getHealthStatus(): Promise<HealthStatus>;
  getMetrics(): Promise<OrchestratorMetrics>;
}
```

**配置示例**:
```typescript
const orchestratorConfig = {
  maxConcurrentAgents: 50,
  taskQueueSize: 1000,
  persistSessions: true,
  sessionRetentionMs: 3600000,
  taskMaxRetries: 3,
  healthCheckInterval: 30000,
  maintenanceInterval: 300000,
  shutdownTimeout: 30000
};
```

### 2. EventBus - 事件总线

**职责**: 提供系统-wide 的异步事件通信机制，支持组件间的松耦合通信。

**核心功能**:
- **类型安全事件**: 基于 TypeScript 的类型化事件系统
- **事件统计**: 事件计数、频率分析和性能监控
- **过滤监听**: 支持条件过滤的事件监听器
- **异步等待**: 支持等待特定事件的发生

**关键接口**:
```typescript
interface IEventBus {
  emit(event: string, data?: unknown): void;
  on(event: string, handler: (data: unknown) => void): void;
  off(event: string, handler: (data: unknown) => void): void;
  once(event: string, handler: (data: unknown) => void): void;
  waitFor(event: string, timeoutMs?: number): Promise<unknown>;
  onFiltered(event: string, filter: (data: unknown) => boolean, handler: (data: unknown) => void): void;
}
```

**使用示例**:
```typescript
// 监听系统事件
eventBus.on(SystemEvents.AGENT_SPAWNED, (data) => {
  console.log('代理已创建:', data.agentId);
});

// 等待事件完成
await eventBus.waitFor('task:completed', 30000);

// 过滤监听
eventBus.onFiltered('metrics:collected',
  (data) => data.cpuUsage > 80,
  (data) => console.log('高CPU使用率告警:', data)
);
```

### 3. HiveMindCore - 集体智能核心

**职责**: 实现分布式 AI 协调的 Queen-Worker 模式，提供集体智能和自主决策能力。

**核心功能**:
- **Queen 智能体**: 战略规划和任务分解
- **Worker 池管理**: 按专业能力组织的代理池
- **目标执行**: 分布式目标分解和执行
- **适应性学习**: 基于反馈的自适应优化
- **共识机制**: 多代理决策的一致性保证

**关键接口**:
```typescript
interface HiveMindConfig {
  maxWorkerPools: number;
  queenEnabled: boolean;
  adaptationRate: number;
  consensusThreshold: number;
  specializations: string[];
}

class HiveMindCore {
  async setObjective(objective: Omit<Objective, 'id'>): Promise<string>;
  async executeObjective(objectiveId: string): Promise<ExecutionResult>;
  async adapt(feedback: Feedback[]): Promise<void>;
  async getStatus(): Promise<HiveMindStatus>;
}
```

**配置示例**:
```typescript
const hiveMindConfig = {
  maxWorkerPools: 5,
  queenEnabled: true,
  adaptationRate: 0.1,
  consensusThreshold: 0.7,
  specializations: ['research', 'development', 'testing', 'optimization', 'coordination']
};
```

### 4. AgentRegistry - 代理注册中心

**职责**: 管理所有代理的注册、发现和生命周期。

**核心功能**:
- **代理注册**: 代理能力和状态的注册管理
- **动态发现**: 代理能力的动态发现和匹配
- **健康检查**: 代理健康状态监控
- **负载均衡**: 代理负载分析和分配建议

### 5. ConfigManager - 配置管理器

**职责**: 提供统一的配置管理服务，支持动态配置更新和环境适配。

**核心功能**:
- **分层配置**: 支持全局、模块和代理级别的配置
- **动态更新**: 运行时配置热更新
- **环境适配**: 多环境的配置自动适配
- **配置验证**: 配置完整性和有效性验证

### 6. MetricsCollector - 指标收集器

**职责**: 收集、聚合和分析系统运行指标，提供性能监控和告警能力。

**核心功能**:
- **实时指标**: CPU、内存、网络等系统指标
- **业务指标**: 任务执行率、成功率等业务指标
- **性能分析**: 性能瓶颈识别和优化建议
- **告警机制**: 基于阈值的自动告警

## 开发规范和最佳实践

### 1. 组件初始化模式

所有核心组件都遵循标准的初始化模式：

```typescript
class CoreComponent {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      throw new InitializationError('Component already initialized');
    }

    try {
      await this.setupDependencies();
      await this.validateConfiguration();
      await this.startServices();
      this.initialized = true;
    } catch (error) {
      await this.emergencyCleanup();
      throw new InitializationError('Component initialization failed', { error });
    }
  }
}
```

### 2. 错误处理策略

采用分层错误处理和恢复机制：

```typescript
// 电路熔断器模式
const circuitBreaker = circuitBreaker('ComponentName', {
  threshold: 5,
  timeout: 30000,
  resetTimeout: 60000
});

// 重试机制
await retry(() => this.criticalOperation(), {
  maxAttempts: 3,
  initialDelay: 2000,
  backoff: 'exponential'
});
```

### 3. 事件驱动设计

使用事件驱动架构实现组件解耦：

```typescript
// 系统事件定义
export const SystemEvents = {
  AGENT_SPAWNED: 'agent:spawned',
  TASK_COMPLETED: 'task:completed',
  SYSTEM_ERROR: 'system:error',
  DEADLOCK_DETECTED: 'deadlock:detected'
} as const;

// 事件发布
eventBus.emit(SystemEvents.AGENT_SPAWNED, {
  agentId: agent.id,
  profile: agent.profile,
  timestamp: new Date()
});
```

### 4. 资源管理模式

```typescript
// 资源清理模式
abstract class ResourceManager {
  protected resources = new Set<Resource>();

  async acquire<T extends Resource>(resource: T): Promise<T> {
    await resource.initialize();
    this.resources.add(resource);
    return resource;
  }

  async cleanup(): Promise<void> {
    await Promise.allSettled(
      Array.from(this.resources).map(resource => resource.cleanup())
    );
    this.resources.clear();
  }
}
```

## 与其他模块的集成

### 1. 与 Swarm 模块集成

```typescript
// 核心模块为 Swarm 提供基础设施
class SwarmIntegration {
  constructor(
    private orchestrator: Orchestrator,
    private eventBus: EventBus,
    private agentRegistry: AgentRegistry
  ) {}

  async createSwarmAgent(type: AgentType): Promise<string> {
    const profile = await this.agentRegistry.createProfile(type);
    return this.orchestrator.spawnAgent(profile);
  }
}
```

### 2. 与 MCP 模块集成

```typescript
// MCP 服务器的核心支持
class MCPCoreIntegration {
  async initializeMCPServer(): Promise<void> {
    const server = new MCPServer(
      this.config.mcp,
      this.eventBus,
      this.logger,
      this.orchestrator  // 注入核心编排器
    );

    await server.start();
  }
}
```

### 3. 与 Verification 模块集成

```typescript
// 验证系统的事件集成
class VerificationIntegration {
  setupVerificationHooks(): void {
    this.eventBus.on(SystemEvents.TASK_COMPLETED, async (data) => {
      await this.verificationSystem.validateResult(data);
    });
  }
}
```

### 4. 与 Coordination 模块集成

```typescript
// 协调模块的核心服务依赖
class CoordinationCoreIntegration {
  async initialize(): Promise<void> {
    this.coordinationManager.setEventBus(this.eventBus);
    this.coordinationManager.setMetricsCollector(this.metricsCollector);
  }
}
```

## 配置和使用示例

### 1. 基础系统配置

```typescript
// config/production.json
{
  "core": {
    "orchestrator": {
      "maxConcurrentAgents": 100,
      "taskQueueSize": 5000,
      "persistSessions": true,
      "enableParallelExecution": true
    },
    "eventBus": {
      "debug": false,
      "maxEventHistory": 10000
    },
    "hiveMind": {
      "maxWorkerPools": 10,
      "queenEnabled": true,
      "adaptationRate": 0.15
    }
  }
}
```

### 2. 系统初始化示例

```typescript
import {
  Orchestrator,
  EventBus,
  HiveMindCore,
  AgentRegistry
} from './core/index.js';

async function initializeSystem() {
  // 1. 初始化事件总线
  const eventBus = EventBus.getInstance();

  // 2. 初始化核心组件
  const agentRegistry = new AgentRegistry();
  const hiveMind = new HiveMindCore(database, agentRegistry, consensusEngine, metricsCollector);

  // 3. 创建编排器
  const orchestrator = new Orchestrator(
    config,
    terminalManager,
    memoryManager,
    coordinationManager,
    mcpServer,
    eventBus,
    logger
  );

  // 4. 初始化系统
  await Promise.all([
    orchestrator.initialize(),
    hiveMind.initialize()
  ]);

  console.log('✅ 核心系统初始化完成');
}
```

### 3. 高可用配置

```typescript
// 高可用性配置
const highAvailabilityConfig = {
  orchestrator: {
    healthCheckInterval: 10000,  // 10秒健康检查
    maintenanceInterval: 60000,  // 1分钟维护
    circuitBreaker: {
      threshold: 3,
      timeout: 5000,
      resetTimeout: 15000
    }
  },
  eventBus: {
    enableMetrics: true,
    maxEventHistory: 50000
  },
  persistence: {
    enableSnapshots: true,
    snapshotInterval: 300000,  // 5分钟快照
    enableReplication: true
  }
};
```

## 性能优化建议

### 1. 并发执行优化

- **并行代理创建**: 使用 `spawnParallelAgents` 提升启动速度 10-20x
- **异步初始化**: 组件并行初始化减少启动时间
- **批量操作**: 批量处理任务和事件减少开销

### 2. 内存管理优化

- **对象池化**: 重用频繁创建的对象
- **事件历史限制**: 限制事件历史大小避免内存泄漏
- **定期清理**: 定期清理过期数据和缓存

### 3. 事件系统优化

- **事件过滤**: 使用过滤监听器减少不必要的处理
- **异步事件**: 非关键事件使用异步处理
- **事件聚合**: 批量处理相似事件

## 监控和诊断

### 1. 关键指标监控

```typescript
// 核心系统指标
interface CoreMetrics {
  // 系统健康
  componentHealth: Record<string, ComponentHealth>;

  // 性能指标
  averageResponseTime: number;
  throughput: number;
  errorRate: number;

  // 资源使用
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;

  // 业务指标
  activeAgents: number;
  queuedTasks: number;
  completedTasks: number;
}
```

### 2. 诊断工具

```typescript
// 系统诊断
class SystemDiagnostics {
  async generateDiagnosticReport(): Promise<DiagnosticReport> {
    return {
      timestamp: new Date(),
      componentStatus: await this.checkAllComponents(),
      performanceMetrics: await this.collectMetrics(),
      recentErrors: await this.getRecentErrors(),
      recommendations: await this.generateRecommendations()
    };
  }
}
```

## 故障排除指南

### 1. 常见问题

**代理启动失败**
```bash
# 检查系统资源
free -h
df -h

# 检查配置文件
claude-flow config validate

# 查看详细日志
claude-flow logs --component core --level debug
```

**事件总线延迟**
```typescript
// 检查事件统计
const stats = eventBus.getEventStats();
console.log('事件处理统计:', stats);

// 检查监听器数量
const listenerCounts = eventBus.getListenerCounts();
console.log('监听器数量:', listenerCounts);
```

### 2. 性能调优

```typescript
// 调整并发参数
const optimizedConfig = {
  orchestrator: {
    maxConcurrentAgents: Math.min(os.cpus().length * 2, 50),
    taskQueueSize: 1000,
    parallelExecutionBatchSize: 5
  }
};
```

## 变更记录 (Changelog)

### v2.0.0 (2025-11-24)
- ✨ 新增: 并行代理执行支持，性能提升 10-20x
- ✨ 新增: HiveMind 集体智能核心
- ✨ 新增: 电路熔断器模式
- ✨ 新增: 实时查询控制器
- 🔧 改进: 事件总线性能优化
- 🔧 改进: 会话持久化机制
- 🐛 修复: 内存泄漏问题
- 🐛 修复: 并发安全问题

### v1.5.0 (2025-10-15)
- ✨ 新增: 健康检查自动恢复
- ✨ 新增: 指标收集和告警
- 🔧 改进: 错误处理和重试机制
- 📚 文档: 完善API文档

---

> 该模块是 Claude-Flow 系统的核心，负责整个系统的编排、协调和管理。所有其他模块都依赖于该模块提供的基础服务。在修改该模块代码时，请务必考虑向后兼容性和系统稳定性。