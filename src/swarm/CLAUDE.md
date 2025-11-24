[根目录](../../CLAUDE.md) > [src](../) > **swarm**

# 群体协调模块 (src/swarm)

## 模块架构与职责

Swarm 模块是 Claude-Flow 的多代理协调系统，实现了群体智能和分布式协作能力。该模块采用去中心化架构，支持大规模代理集群的自组织、自适应和高效协作。

### 群体系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Swarm 群体协调架构                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ SwarmCoordinator│  │ AutoStrategy    │  │ MemorySystem    │ │
│  │ (群体协调器)      │  │ (自动策略)       │  │ (记忆系统)       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ ExecutorEngine  │  │ PromptManager   │  │ ResultAggregator│ │
│  │ (执行引擎)       │  │ (提示管理器)     │  │ (结果聚合器)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Optimization    │  │ Strategies       │  │ JSONOutput      │ │
│  │ (性能优化)       │  │ (策略系统)       │  │ (JSON输出)       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 主要组件和接口

### 1. SwarmCoordinator - 群体协调器

**职责**: Swarm 系统的核心协调组件，管理代理生命周期、任务分配和群体协作。

**核心功能**:
- **代理管理**: 注册、启动、停止和监控代理
- **任务分解**: 智能任务分解和依赖分析
- **负载均衡**: 动态负载分配和资源调度
- **容错处理**: 代理故障检测和自动恢复
- **性能监控**: 实时性能指标收集和分析

**关键接口**:
```typescript
interface SwarmCoordinator {
  // 生命周期管理
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;

  // 目标管理
  createObjective(name: string, description: string, strategy?: SwarmStrategy): Promise<string>;
  executeObjective(objectiveId: string): Promise<void>;

  // 代理管理
  registerAgent(name: string, type: AgentType, capabilities?: Partial<AgentCapabilities>): Promise<string>;
  unregisterAgent(agentId: string): Promise<void>;

  // 任务管理
  createTask(type: TaskType, name: string, description: string, instructions: string): Promise<string>;
  assignTask(taskId: string, agentId?: string): Promise<void>;

  // 状态查询
  getStatus(): SwarmStatus;
  getMetrics(): SwarmMetrics;
  getAgents(): AgentState[];
  getTasks(): TaskDefinition[];
}
```

**配置示例**:
```typescript
const swarmConfig: SwarmConfig = {
  name: 'Development Swarm',
  mode: 'parallel',  // 'centralized' | 'parallel' | 'distributed'
  strategy: 'auto',  // 'auto' | 'research' | 'development' | 'testing'
  maxAgents: 10,
  maxTasks: 100,
  maxDuration: 4 * 60 * 60 * 1000, // 4小时
  qualityThreshold: 0.8,
  reviewRequired: true,
  testingRequired: true,
  monitoring: {
    metricsEnabled: true,
    loggingEnabled: true,
    heartbeatInterval: 30000,
    healthCheckInterval: 60000
  }
};
```

### 2. AutoStrategy - 自动策略系统

**职责**: 智能分析和选择最优的执行策略，实现自适应的任务分解和代理分配。

**核心功能**:
- **智能分析**: 任务复杂度和需求分析
- **策略选择**: 基于任务特征自动选择最优策略
- **动态调整**: 根据执行情况动态调整策略
- **学习优化**: 基于历史数据优化策略选择

**策略类型**:
```typescript
enum SwarmStrategy {
  AUTO = 'auto',           // 自动选择最优策略
  RESEARCH = 'research',   // 研究分析策略
  DEVELOPMENT = 'development', // 开发实现策略
  TESTING = 'testing',     // 测试验证策略
  ANALYSIS = 'analysis',   // 分析评估策略
  OPTIMIZATION = 'optimization' // 优化改进策略
}
```

**使用示例**:
```typescript
const autoStrategy = new AutoStrategy({
  enableLearning: true,
  adaptationRate: 0.1,
  performanceThreshold: 0.8
});

// 自动分解目标
const decompositionResult = await autoStrategy.decomposeObjective(objective);
console.log('任务分解结果:', decompositionResult.tasks);
console.log('依赖关系:', decompositionResult.dependencies);
```

### 3. ExecutorEngine - 执行引擎

**职责**: 管理代理的实际执行过程，提供多种执行模式和优化策略。

**执行模式**:
- **并行执行**: 多代理并行处理任务
- **串行执行**: 按依赖顺序执行任务
- **混合执行**: 结合并行和串行的智能执行
- **自适应执行**: 根据系统负载动态调整执行策略

**关键组件**:
```typescript
// Claude Flow 执行器
class ClaudeFlowExecutor {
  async executeTask(task: TaskDefinition, agent: AgentState, targetDir?: string): Promise<any>;
}

// 并行执行器
class ParallelExecutor {
  async executeParallel(tasks: TaskDefinition[], agents: AgentState[]): Promise<ExecutionResult[]>;
}

// 优化执行器
class OptimizedExecutor {
  async executeWithOptimization(task: TaskDefinition, agent: AgentState): Promise<any>;
}
```

### 4. MemorySystem - 记忆系统

**职责**: 为代理群体提供共享记忆和知识管理能力。

**核心功能**:
- **共享记忆**: 代理间的知识共享和传承
- **经验积累**: 执行经验和结果的学习
- **上下文管理**: 任务和代理的上下文信息管理
- **知识图谱**: 构建和维护领域知识图谱

### 5. PromptManager - 提示管理器

**职责**: 管理和优化代理执行时使用的提示模板和参数。

**核心功能**:
- **模板管理**: 预定义的提示模板库
- **动态生成**: 基于任务特征动态生成提示
- **优化建议**: 基于执行结果优化提示
- **A/B测试**: 提示效果对比和优化

### 6. ResultAggregator - 结果聚合器

**职责**: 收集、验证和聚合多代理的执行结果。

**核心功能**:
- **结果收集**: 收集所有代理的执行结果
- **质量验证**: 结果质量和一致性验证
- **冲突解决**: 处理结果间的冲突和矛盾
- **最终聚合**: 生成统一的最终结果

## 开发规范和最佳实践

### 1. 代理生命周期管理

```typescript
// 标准的代理生命周期
class AgentLifecycle {
  async createAgent(type: AgentType): Promise<string> {
    // 1. 创建代理配置
    const profile = this.createAgentProfile(type);

    // 2. 注册代理
    const agentId = await this.swarmCoordinator.registerAgent(
      profile.name,
      profile.type,
      profile.capabilities
    );

    // 3. 启动代理
    await this.swarmCoordinator.startAgent(agentId);

    return agentId;
  }

  async gracefulShutdown(agentId: string): Promise<void> {
    // 1. 停止新任务分配
    await this.pauseAgent(agentId);

    // 2. 等待当前任务完成
    await this.waitForTaskCompletion(agentId);

    // 3. 清理资源
    await this.unregisterAgent(agentId);
  }
}
```

### 2. 任务分解模式

```typescript
// 智能任务分解
class TaskDecomposer {
  async decomposeObjective(objective: SwarmObjective): Promise<TaskDecomposition> {
    // 1. 分析目标复杂度
    const complexity = this.analyzeComplexity(objective);

    // 2. 确定执行策略
    const strategy = this.selectStrategy(complexity, objective.strategy);

    // 3. 分解为任务
    const tasks = await this.createTasks(objective, strategy);

    // 4. 分析依赖关系
    const dependencies = this.analyzeDependencies(tasks);

    return { tasks, dependencies, strategy };
  }

  private createTasks(objective: SwarmObjective, strategy: SwarmStrategy): TaskDefinition[] {
    switch (strategy) {
      case 'development':
        return this.createDevelopmentTasks(objective);
      case 'research':
        return this.createResearchTasks(objective);
      case 'testing':
        return this.createTestingTasks(objective);
      default:
        return this.createGenericTasks(objective);
    }
  }
}
```

### 3. 负载均衡策略

```typescript
// 智能负载均衡
class LoadBalancer {
  selectBestAgent(task: TaskDefinition, availableAgents: AgentState[]): AgentState | null {
    // 1. 能力匹配评分
    const capabilityScores = availableAgents.map(agent => ({
      agent,
      score: this.calculateCapabilityScore(agent, task)
    }));

    // 2. 负载均衡评分
    const loadScores = capabilityScores.map(({ agent, score }) => ({
      agent,
      score: score + this.calculateLoadScore(agent)
    }));

    // 3. 历史表现评分
    const finalScores = loadScores.map(({ agent, score }) => ({
      agent,
      score: score + this.calculatePerformanceScore(agent)
    }));

    // 4. 选择最高分代理
    return finalScores.reduce((best, current) =>
      current.score > best.score ? current : best
    ).agent;
  }

  private calculateCapabilityScore(agent: AgentState, task: TaskDefinition): number {
    const requiredCapabilities = task.requirements.capabilities;
    const matchedCapabilities = requiredCapabilities.filter(cap =>
      this.agentHasCapability(agent, cap)
    ).length;

    return matchedCapabilities / requiredCapabilities.length;
  }
}
```

### 4. 容错和恢复机制

```typescript
// 故障检测和恢复
class FaultToleranceManager {
  async handleAgentFailure(agentId: string, error: Error): Promise<void> {
    // 1. 记录错误信息
    this.logger.error('代理执行失败', { agentId, error });

    // 2. 检查错误类型
    const errorType = this.classifyError(error);

    // 3. 执行恢复策略
    switch (errorType) {
      case 'TIMEOUT':
        await this.handleTimeout(agentId);
        break;
      case 'RESOURCE_EXHAUSTION':
        await this.handleResourceExhaustion(agentId);
        break;
      case 'DEPENDENCY_FAILURE':
        await this.handleDependencyFailure(agentId);
        break;
      default:
        await this.handleGenericFailure(agentId);
    }
  }

  private async handleTimeout(agentId: string): Promise<void> {
    // 1. 增加超时时间
    const agent = this.swarmCoordinator.getAgent(agentId);
    if (agent) {
      agent.config.timeoutThreshold *= 1.5;
    }

    // 2. 重试当前任务
    await this.retryCurrentTask(agentId);

    // 3. 降低代理负载
    await this.reduceAgentLoad(agentId);
  }
}
```

## 与其他模块的集成

### 1. 与 Core 模块集成

```typescript
// 核心系统服务集成
class SwarmCoreIntegration {
  constructor(
    private swarmCoordinator: SwarmCoordinator,
    private orchestrator: Orchestrator,
    private eventBus: EventBus
  ) {}

  async initialize(): Promise<void> {
    // 注入核心服务
    this.swarmCoordinator.setOrchestrator(this.orchestrator);
    this.swarmCoordinator.setEventBus(this.eventBus);

    // 设置事件监听
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.eventBus.on('system:ready', () => {
      this.swarmCoordinator.start();
    });

    this.eventBus.on('system:shutdown', () => {
      this.swarmCoordinator.shutdown();
    });
  }
}
```

### 2. 与 MCP 模块集成

```typescript
// MCP 工具集成
class SwarmMCPIntegration {
  registerSwarmTools(mcpServer: MCPServer): void {
    // Swarm 管理工具
    mcpServer.registerTool({
      name: 'swarm_create_objective',
      description: '创建 Swarm 执行目标',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          strategy: { enum: ['auto', 'research', 'development', 'testing'] }
        }
      },
      handler: async (input) => {
        return await this.swarmCoordinator.createObjective(
          input.name,
          input.description,
          input.strategy
        );
      }
    });

    // 代理管理工具
    mcpServer.registerTool({
      name: 'swarm_register_agent',
      description: '注册新代理到 Swarm',
      handler: async (input) => {
        return await this.swarmCoordinator.registerAgent(
          input.name,
          input.type,
          input.capabilities
        );
      }
    });
  }
}
```

### 3. 与 Verification 模块集成

```typescript
// 验证系统集成
class SwarmVerificationIntegration {
  async setupVerification(): Promise<void> {
    // 任务执行验证
    this.swarmCoordinator.on('task:completed', async (event) => {
      const { task, result } = event.data;

      // 验证执行结果
      const verification = await this.verificationSystem.verifyTaskResult(task, result);

      if (!verification.passed) {
        // 标记任务为失败
        await this.swarmCoordinator.failTask(task.id, verification.error);
      }
    });

    // 代理行为验证
    this.swarmCoordinator.on('agent:heartbeat', async (event) => {
      const { agentId, metrics } = event.data;

      // 检查代理行为异常
      const anomaly = await this.verificationSystem.detectAnomaly(agentId, metrics);

      if (anomaly.detected) {
        await this.handleAnomalousAgent(agentId, anomaly);
      }
    });
  }
}
```

### 4. 与 Coordination 模块集成

```typescript
// 协调系统集成
class SwarmCoordinationIntegration {
  async initializeCoordination(): Promise<void> {
    // 设置 Swarm 为全局协调器
    this.coordinationManager.setGlobalCoordinator(this.swarmCoordinator);

    // 启用高级调度
    this.coordinationManager.enableAdvancedScheduling();

    // 配置工作窃取
    this.coordinationManager.enableWorkStealing();
  }

  private setupResourceSharing(): void {
    // Swarm 内部资源共享
    this.swarmCoordinator.on('resource:requested', async (event) => {
      const { resourceId, agentId } = event.data;

      // 协调资源分配
      const allocation = await this.coordinationManager.allocateResource(
        resourceId,
        agentId
      );

      if (allocation.success) {
        await this.swarmCoordinator.grantResource(agentId, resourceId);
      }
    });
  }
}
```

## 配置和使用示例

### 1. 基础 Swarm 配置

```typescript
// config/swarm.json
{
  "swarm": {
    "name": "Development Swarm",
    "mode": "parallel",
    "strategy": "auto",
    "maxAgents": 10,
    "maxTasks": 100,
    "maxDuration": 14400000,
    "qualityThreshold": 0.8,
    "reviewRequired": true,
    "testingRequired": true,
    "monitoring": {
      "metricsEnabled": true,
      "loggingEnabled": true,
      "heartbeatInterval": 30000,
      "healthCheckInterval": 60000,
      "alertingEnabled": true,
      "alertThresholds": {
        "errorRate": 0.1,
        "responseTime": 10000,
        "memoryUsage": 0.8
      }
    },
    "performance": {
      "maxConcurrency": 10,
      "defaultTimeout": 300000,
      "cacheEnabled": true,
      "optimizationEnabled": true,
      "adaptiveScheduling": true
    }
  }
}
```

### 2. 创建和执行 Swarm

```typescript
import { SwarmCoordinator } from './swarm/index.js';

async function createAndExecuteSwarm() {
  // 1. 创建 Swarm 协调器
  const swarmCoordinator = new SwarmCoordinator({
    mode: 'parallel',
    strategy: 'auto',
    maxAgents: 8,
    qualityThreshold: 0.85,
    monitoring: {
      metricsEnabled: true,
      loggingEnabled: true
    }
  });

  // 2. 初始化 Swarm
  await swarmCoordinator.initialize();

  // 3. 注册代理
  const coderAgent = await swarmCoordinator.registerAgent(
    'Senior Developer',
    'coder',
    {
      codeGeneration: true,
      codeReview: true,
      frameworks: ['react', 'node.js'],
      languages: ['typescript', 'javascript']
    }
  );

  const testerAgent = await swarmCoordinator.registerAgent(
    'QA Engineer',
    'tester',
    {
      testing: true,
      codeReview: true,
      frameworks: ['jest', 'cypress']
    }
  );

  // 4. 创建执行目标
  const objectiveId = await swarmCoordinator.createObjective(
    'Build REST API',
    'Create a comprehensive REST API with authentication and CRUD operations in the api directory',
    'development'
  );

  // 5. 执行目标
  await swarmCoordinator.executeObjective(objectiveId);

  // 6. 监控执行状态
  const status = swarmCoordinator.getStatus();
  console.log('Swarm 状态:', status);

  // 7. 获取执行结果
  const metrics = swarmCoordinator.getMetrics();
  console.log('执行指标:', metrics);
}
```

### 3. 并行执行示例

```typescript
// 并行代理执行
async function parallelExecutionExample() {
  const swarmCoordinator = new SwarmCoordinator({
    mode: 'parallel',
    maxAgents: 5,
    strategy: 'auto'
  });

  await swarmCoordinator.initialize();

  // 创建多个并行代理
  const agentTypes = ['coder', 'tester', 'reviewer', 'analyst', 'documentation'];
  const agentIds = await Promise.all(
    agentTypes.map(type =>
      swarmCoordinator.registerAgent(`${type} Agent`, type as AgentType)
    )
  );

  // 创建并行执行目标
  const objectiveId = await swarmCoordinator.createObjective(
    'Full Stack Development',
    'each agent type work on implementing a complete web application in the examples/webapp directory',
    'development'
  );

  // 执行并监控
  await swarmCoordinator.executeObjective(objectiveId);

  // 等待完成
  while (swarmCoordinator.getStatus() === 'executing') {
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('执行进度:', swarmCoordinator.getSwarmStatus());
  }

  console.log('执行完成！');
}
```

### 4. 自定义策略示例

```typescript
// 自定义执行策略
class CustomStrategy implements SwarmStrategy {
  async decomposeObjective(objective: SwarmObjective): Promise<TaskDecomposition> {
    // 自定义任务分解逻辑
    const tasks = [
      this.createAnalysisTask(objective),
      this.createDesignTask(objective),
      this.createImplementationTask(objective),
      this.createTestingTask(objective)
    ];

    return {
      tasks,
      dependencies: this.createDependencies(tasks),
      strategy: 'custom'
    };
  }

  private createAnalysisTask(objective: SwarmObjective): TaskDefinition {
    return {
      id: generateId('task'),
      type: 'analysis',
      name: 'Requirements Analysis',
      description: `Analyze requirements for: ${objective.description}`,
      requirements: {
        capabilities: ['analysis', 'research'],
        tools: ['documentation'],
        permissions: ['read']
      }
    };
  }
}

// 注册自定义策略
const swarmCoordinator = new SwarmCoordinator({
  strategy: 'custom',
  customStrategies: {
    custom: new CustomStrategy()
  }
});
```

## 性能优化建议

### 1. 并行执行优化

- **批量代理创建**: 使用并行创建减少启动时间
- **智能任务分配**: 基于能力和负载优化任务分配
- **依赖并行化**: 识别无依赖任务并行执行

### 2. 资源管理优化

```typescript
// 资源池管理
class AgentPoolManager {
  private pools = new Map<AgentType, AgentPool>();

  async getAgent(type: AgentType): Promise<AgentState> {
    const pool = this.pools.get(type);
    if (!pool) {
      await this.createPool(type);
    }
    return this.pools.get(type)!.acquire();
  }

  async releaseAgent(agent: AgentState): Promise<void> {
    const pool = this.pools.get(agent.type);
    if (pool) {
      pool.release(agent);
    }
  }
}
```

### 3. 缓存和记忆优化

```typescript
// 结果缓存
class ResultCache {
  private cache = new LRUCache<string, CachedResult>(1000);

  async cacheResult(taskId: string, result: any): Promise<void> {
    const key = this.generateCacheKey(taskId);
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      ttl: 3600000 // 1小时
    });
  }

  async getCachedResult(taskId: string): Promise<any | null> {
    const key = this.generateCacheKey(taskId);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.result;
    }

    return null;
  }
}
```

## 监控和诊断

### 1. 关键指标监控

```typescript
interface SwarmMetrics {
  // 执行指标
  throughput: number;
  latency: number;
  efficiency: number;
  reliability: number;

  // 代理指标
  agentUtilization: number;
  agentSatisfaction: number;
  collaborationEffectiveness: number;

  // 任务指标
  averageQuality: number;
  defectRate: number;
  reworkRate: number;

  // 资源指标
  resourceUtilization: Record<string, number>;
  costEfficiency: number;
}
```

### 2. 实时监控仪表板

```typescript
class SwarmDashboard {
  async generateRealtimeMetrics(): Promise<DashboardData> {
    return {
      swarmStatus: this.swarmCoordinator.getStatus(),
      agentMetrics: this.getAgentMetrics(),
      taskMetrics: this.getTaskMetrics(),
      performanceMetrics: this.getPerformanceMetrics(),
      alerts: this.getActiveAlerts()
    };
  }

  private getAgentMetrics(): AgentMetrics[] {
    const agents = this.swarmCoordinator.getAgents();
    return agents.map(agent => ({
      id: agent.id.id,
      name: agent.name,
      type: agent.type,
      status: agent.status,
      currentTask: agent.currentTask,
      performance: agent.metrics,
      health: agent.health,
      workload: agent.workload
    }));
  }
}
```

## 故障排除指南

### 1. 常见问题诊断

**代理执行超时**
```bash
# 检查代理状态
claude-flow swarm status --agents

# 查看代理日志
claude-flow swarm logs --agent <agent-id> --level debug

# 重启问题代理
claude-flow swarm restart-agent <agent-id>
```

**任务执行失败**
```typescript
// 诊断任务失败
async function diagnoseTaskFailure(taskId: string) {
  const task = swarmCoordinator.getTask(taskId);

  console.log('任务详情:', {
    id: task.id,
    type: task.type,
    status: task.status,
    error: task.error,
    attempts: task.attempts.length
  });

  // 检查依赖任务
  const dependencies = task.constraints.dependencies;
  for (const depId of dependencies) {
    const depTask = swarmCoordinator.getTask(depId);
    console.log(`依赖任务 ${depId}:`, depTask.status);
  }
}
```

### 2. 性能调优

```typescript
// 性能优化配置
const performanceOptimizedConfig: SwarmConfig = {
  maxAgents: Math.min(os.cpus().length * 2, 20),
  performance: {
    maxConcurrency: os.cpus().length,
    defaultTimeout: 600000,
    cacheEnabled: true,
    optimizationEnabled: true,
    adaptiveScheduling: true,
    predictiveLoading: true,
    resourcePooling: true
  },
  monitoring: {
    metricsEnabled: true,
    metricsInterval: 10000,
    alertingEnabled: true
  }
};
```

## 变更记录 (Changelog)

### v2.1.0 (2025-11-24)
- ✨ 新增: 优化执行器性能提升模块
- ✨ 新增: JSON 输出聚合器
- ✨ 新增: 自适应负载均衡
- 🔧 改进: AutoStrategy 智能化程度
- 🔧 改进: 代理生命周期管理
- 🐛 修复: 并发执行死锁问题
- 🐛 修复: 内存泄漏问题

### v2.0.0 (2025-10-01)
- ✨ 重构: 全新 SwarmCoordinator 架构
- ✨ 新增: 并行执行模式支持
- ✨ 新增: 自动策略选择系统
- 🔧 改进: 任务分解算法
- 📚 文档: 完善API文档和示例

---

> Swarm 模块实现了多代理群体的智能协调和自组织能力。通过该模块，Claude-Flow 能够高效地分配和管理大规模代理集群，实现复杂任务的并行执行和协作完成。在使用时请根据实际需求调整代理数量和执行策略，以获得最佳性能表现。