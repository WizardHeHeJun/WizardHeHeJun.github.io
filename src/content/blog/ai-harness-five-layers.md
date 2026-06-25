---
title: '给 AI 装上工程化中间层：一套五层 Claude Code Harness 的设计图解'
description: '夹在 AI 与项目之间的五层中间层：约束、工具、反馈、教训一次讲透。'
pubDate: 'Jun 25 2026'
category: '技术笔记'
tags: ['Claude Code', 'Harness', '上下文工程', 'AI 编程', 'Agent']
heroImage: '../../assets/blog/ai-harness-five-layers.jpg'
---

> 这是一套**自用的 Claude Code Harness**——不是什么上线产品，而是夹在「AI 模型」和「真实项目」中间的一层工程脚手架，专门用来稳定地产出一个**多 Agent 协作系统**。
>
> 文中所有框架图、流程图都按仓库里钩子 / 引擎的**真实行为**绘制。适合这样的你：想给自己的项目搭一层「能精确控制 AI 编码」的中间层，却又不知道该分哪几层、每层放什么。

## 一、先说问题：AI 编码工具的那堵墙

现在的 AI 编码工具，在写样板、查 API、排小 Bug 上已经「大体好用」。但一落到有架构约束的真实项目，就会撞上同一堵墙：**大方向能跑通，精确控制难**。

这不是模型不够聪明，而是**模型和项目之间缺一个工程化中间层**。失控通常是四类：

| 失控层面 | 现象 | 在「多 Agent + 记忆」领域的具体表现 |
| --- | --- | --- |
| 约束没投喂 | 项目规范默认不在上下文里，模型按通用习惯写 | Agent 直连 Neo4j 绕过记忆层封装；记忆写入不带 scope |
| 工具够不着 | 项目工具链之外的操作干不了 | 起 LangGraph 图、连 Postgres/图谱查运行态 |
| 写完没法验证 | 缺自动反馈环，对错只能等人跑 | 记忆写入时机错了，要等图谱抖动才发现 |
| 坑会再踩 | 教训不持久化，跨会话反复犯 | 「每条消息后刷图谱」纠正完，下次又犯 |

```mermaid
flowchart LR
    M["AI 模型<br/>(通用能力强)"]
    GAP["缺少中间层<br/>约束/工具/反馈/记忆 都对不上"]
    P["真实项目<br/>(有架构与硬约束)"]
    M -- "按通用习惯写" --> GAP
    GAP -- "撞墙：方向对、细节失控" --> P

    M2["AI 模型"]
    H["Harness<br/>工程化中间层"]
    P2["真实项目"]
    M2 --> H --> P2
    H -. "① 精确投喂约束" .-> M2
    H -. "② 接入够不着的工具" .-> M2
    H -. "③ 建自动反馈环" .-> M2
    H -. "④ 沉淀跨会话教训" .-> M2
```

**Harness 干的就是这四件事**：把项目约束精确投喂、把够不着的工具接进来、给产出建自动反馈环、把跨会话教训沉淀成可复用资产。

它的核心命题不是「让 AI 更聪明」，而是——

> **让 AI 在每个时刻都刚好看到它需要的信息、调得动它需要的工具、拿得到它需要的反馈。**

这就是**上下文工程（Context Engineering）**。它有一条硬前提：**上下文窗口有限**，不能也不该全量加载，必须按需、渐进地把最相关的信息送达。整套架构都是围绕这条前提设计的。

## 二、五层架构总览（框架图）

为了同时回答五个**正交**的关切，Harness 拆成五层，每层只回答一个问题，互不干扰、可单独演进：

```mermaid
flowchart TB
    subgraph L5["① 进化层 Evolution —— Harness 自己如何改进?"]
        direction LR
        E1["/learn 沉淀经验"]
        E2["/gc 健康度扫描"]
        E3["pitfalls.md 错误记忆"]
        E4["evals/ 行为回归"]
    end
    subgraph L4["② 编排层 Orchestration —— 怎么组织执行?"]
        direction LR
        O1["/dev 统一入口"]
        O2["PRP 四阶段"]
        O3["/new-agent · /add-memory"]
    end
    subgraph L3["③ 策略层 Policy —— 什么必须 / 禁止做?"]
        direction LR
        P1["CLAUDE.md 硬红线"]
        P2[".claude/rules 5 条 (glob 注入)"]
        P3["project-lint 数据驱动"]
        P4["6 个 Hook · code-reviewer"]
    end
    subgraph L2["④ 知识层 Knowledge —— Agent 知道什么?"]
        direction LR
        K1["CLAUDE.md (全局)"]
        K2["ai-docs 模块三件套"]
        K3["catalog · pitfalls"]
        K4["渐进加载 L1→L3"]
    end
    subgraph L1["⑤ 能力层 Capability —— Agent 能做什么?"]
        direction LR
        C1["run-graph 起 LangGraph"]
        C2["db-shell 查 PG/Neo4j/Redis"]
        C3["复用全局 lark-* / memory"]
    end

    L5 --> L4 --> L3 --> L2 --> L1
    L1 -. "数据流：上层调下层，不可反向依赖" .-> L5
```

**为什么要正交分层？** 因为每层可以独立替换、独立演进——换 lint 规则不影响 PRP 流程，改 PRP 不动能力层。唯一横跨两层的常驻文档是 `CLAUDE.md`：它的「禁令」属策略层，「信息/路由」属知识层。

| 层 | 回答的问题 | 本仓库里它是什么 |
| --- | --- | --- |
| 能力层 Capability | Agent **能做什么** | `.claude/skills/`：run-graph、db-shell |
| 知识层 Knowledge | Agent **知道什么** | `ai-docs/` + `CLAUDE.md` |
| 策略层 Policy | 什么**必须/禁止** | `.claude/rules/` + `hooks/` + `project-lint` |
| 编排层 Orchestration | 怎么**组织执行** | `.claude/commands/`（/dev、PRP 四阶段） |
| 进化层 Evolution | Harness **自己怎么改进** | `.claude/skills/evolution/` + `evals/` |

## 三、两个「依赖方向」别搞混（框架图）

这套体系里有**两个**自上而下的依赖方向，初看容易混，画出来就清楚了：

- **左边**是 Harness 本身的五层（上面那张图的纵深）；
- **右边**是 Harness 要去**生产的目标系统**——一个三层运行架构的多 Agent 系统。

```mermaid
flowchart LR
    subgraph HARNESS["Harness 五层 (工具/脚手架)"]
        direction TB
        h1["进化层"] --> h2["编排层"] --> h3["策略层"] --> h4["知识层"] --> h5["能力层"]
    end

    subgraph TARGET["目标系统三层 (被生产的产品 src/)"]
        direction TB
        t1["编排层 orchestration/agents<br/>LangGraph Supervisor + Worker"]
        t2["记忆层 memory<br/>Zep / Mem0 / Graphiti 封装"]
        t3["存储层 storage<br/>Postgres / Neo4j / Redis"]
        t1 -- "只能调下层" --> t2 -- "只能调下层" --> t3
    end

    HARNESS == "脚手架 / 约束 / 验证" ==> TARGET
```

目标系统那条依赖方向是**硬红线**：存储 ← 记忆 ← 编排，**只能上层调下层，禁止反向/跨层依赖**。运行态（LangGraph Checkpointer）进 Postgres，长期记忆走 Graphiti/图谱库，两者**分离存储**。Harness 的策略层（rules + lint）存在的意义，正是把这条红线变成「机制」而不是「自觉」。

下面逐层拆开看，每层都配一张流程图说明它**怎么运转**。

## 四、能力层：Agent 的手脚

让 Agent 能「跑起来看」，而不只读写文件。本仓库只造领域专属的两个，通用能力（飞书、跨会话记忆）直接复用宿主全局技能，**不重复造**：

| 技能 | 作用 |
| --- | --- |
| `run-graph` | 起 LangGraph 编排图、跑一次输入、查 Checkpointer 运行态 |
| `db-shell` | 连接并查询 PostgreSQL / Neo4j·FalkorDB / Redis（连接串走 `.env`） |

> 设计取舍：能力层最容易膨胀。判断「该不该新建 Skill」的标准是——操作反复出现 / 有可标准化的流程 / 生成代码有固定模板 / 需团队共享最佳实践。够不上就不造。

## 五、知识层：让 Agent「刚好知道」当前要知道的

核心矛盾：**项目知识喂不完，窗口装不下**。解法是**渐进式加载**，只在需要时加载那一份。

```mermaid
flowchart TB
    Start(["会话/操作发生"]) --> L1
    L1["L1 全局 · 会话启动<br/>加载 CLAUDE.md：硬红线 + 路由 + 入口"] --> Edit{"开始操作某文件?"}
    Edit -- "匹配到 glob" --> L2["L2 模式匹配<br/>.claude/rules/* 按 glob 自动注入<br/>(编辑 .py → python-code；src/memory/** → memory-rules)"]
    Edit -- "要编辑具体模块" --> L3["L3 模块级<br/>读 ai-docs/docs/modules/&lt;模块&gt;/ 三件套<br/>guide(必读) / external-api / extension"]
    L2 --> Work(["带着刚好够用的上下文干活"])
    L3 --> Work
    Edit -- "不确定去哪查" --> Cat["查 catalog.md 总目录<br/>或 pitfalls.md 踩过的坑"] --> Work
```

几条关键设计：

- **模块文档三件套**：`<模块>-module-guide.md`（内部架构，编辑前必读）· `-external-api.md`（对外接口/禁止事项，跨模块调用时查）· `-extension-guide.md`（扩展点）。当前已填 `memory` / `orchestration`。
- **CLAUDE.md 必须精干**：前沿 LLM 能可靠遵循的指令大约 150–200 条，写越多遵守率越低。所以它是「最核心 5–10 条 + 索引」，不是百科——细则全部下沉到 rules 和 ai-docs，按需加载。
- **`/generate-doc`** 负责从源码生成/同步文档，专治「代码改了文档没跟上」。

## 六、策略层：知道 ≠ 做到，靠机制不靠自觉

这是整套 Harness 最硬核的一层。核心思想：**Agent 知道规则，不等于会遵守规则**。所以不靠它自觉，而是用机制兜底——规则自动加载、编辑后自动检查、重复犯错自动预警、审查自动触发。

### 6.1 Hook 体系：嵌进 Claude Code 生命周期（流程图）

6 个 Hook 注册在 `.claude/settings.json`，覆盖一次编辑回合的全部关键时点。下面这张时序图就是一个真实编辑回合里它们的触发顺序：

```mermaid
sequenceDiagram
    autonumber
    participant U as 用户/Agent
    participant CC as Claude Code
    participant HK as Hook 体系 (_run.sh 守卫)

    Note over CC,HK: 会话开始
    CC->>HK: SessionStart
    HK-->>CC: conda-env-check.sh 轮询 conda 环境是否就绪

    Note over CC,HK: Agent 准备编辑某文件
    CC->>HK: PreToolUse (Edit/Write)
    HK-->>CC: knowledge-routing.py 注入「该读哪些规则/模块文档」(每文件每会话一次)

    Note over CC,HK: Agent 写入文件后
    CC->>HK: PostToolUse (Edit/Write)
    HK-->>CC: post-edit.sh 自动 ruff/prettier 格式化
    HK-->>CC: lint.py 项目语义检查 —— 违规则 exit 2 反馈 Agent 自纠
    HK-->>CC: doom-loop-detect.py 同文件编辑计数，第 5 次起预警

    Note over CC,HK: 任务收尾 / 上下文压缩
    CC->>HK: Stop
    HK-->>CC: stop-check.py 残留 breakpoint()/高频编辑提醒 (不阻断)
    CC->>HK: PreCompact
    HK-->>CC: precompact-save.py 保存 git 工作态，压缩后可恢复
```

两条贯穿所有 Hook 的铁律：

1. **成功静默、失败冗余**——没事不刷屏，出事就把行号+原因+修复建议+引用一次性喂给 Agent。
2. **守卫包装**：所有 Python hook 都经 `_run.sh` 调用，它依次找 `python/python3/py`，都没有就静默 `exit 0`——保证刚 checkout、还没装 Python 的环境**不会每次编辑都刷错**。

代码佐证：守卫见 `.claude/hooks/_run.sh:6-11`；死循环预警的「第 5 次首警、之后每 +3 次再警」逻辑见 `.claude/hooks/doom-loop-detect.py:57`。

### 6.2 数据驱动的 project-lint：四层过滤流水线（流程图）

`project-lint` 抓的是 **ruff/mypy 查不到的项目语义违规**——比如「记忆写入缺 scope」「Agent 直连存储」「下划线前缀成员」「裸 except」。它的精髓是**规则即数据**：规则全写在 `rules.json`，引擎 `lint.py` 不随规则变化。新增一条规则只改 JSON，不动引擎。

引擎对每条规则跑一条**四层过滤流水线**，逐层收窄、压低误报：

```mermaid
flowchart TB
    F(["编辑后 PostToolUse 喂入文件路径"]) --> PY{"是 .py 文件?"}
    PY -- 否 --> OK0(["静默 exit 0"])
    PY -- 是 --> R{"逐条规则"}
    R --> S1{"① path_contains / file_context<br/>文件级前置条件命中?"}
    S1 -- 不满足 --> SKIP["跳过整条规则"]
    S1 -- 满足 --> S2{"② pattern<br/>行级主正则命中?"}
    S2 -- 否 --> NEXT["看下一行/下一条"]
    S2 -- 是 --> S3{"③ exclude_patterns<br/>命中合法写法?"}
    S3 -- 命中 --> NEXT
    S3 -- 未命中 --> S4{"④ confirm_patterns<br/>需二次确认且命中?"}
    S4 -- 不满足 --> NEXT
    S4 -- 满足 --> V["记一条违规<br/>行号 + 原因 + fix + ref"]
    V --> OUT{"有违规?"}
    NEXT --> OUT
    SKIP --> OUT
    OUT -- 有 --> E2(["打印到 stderr，exit 2<br/>反馈 Agent 自我纠正"])
    OUT -- 无 --> OK(["静默 exit 0"])
```

这套流水线和退出语义直接对应代码 `lint.py:62-89`（四层过滤循环）与 `lint.py:117-120`（违规 exit 2、无违规 exit 0）。它同时支持两种调用：**无参** = Hook 模式从 stdin 读工具负载；**带文件参数** = CLI 测试模式，方便回归。

### 6.3 规则 + 子代理

- **CLAUDE.md 硬红线**（4 条全局禁令，每次会话常驻）：跨层反向依赖 / 每条消息刷图谱 / 默认 user 作用域 / secrets 入库。
- **5 条规则**，由 frontmatter 决定加载时机：`project-root`、`knowledge-routing` 是 `alwaysApply`（常驻）；`python-code` 命中 `**/*.py`；`memory-rules`、`orchestration-rules` 命中各自 `src/**` 路径。
- **code-reviewer 子代理**：lint 管单行能正则化的违规，子代理管**需要推理的宏观问题**——记忆写入时机、层间越界、节点契约、async/生命周期，输出 BLOCK/WARN/INFO 分级报告。

> 一句话记住分工：**rules 注入约束、lint 抓单行违规、code-reviewer 做宏观推理审查**，三者粒度递增、互补不重叠。

## 七、编排层：复杂任务工程化（流程图）

核心洞察：**计划与执行分离**。`/dev` 是统一入口，先判定复杂度，再路由到对应路径——倾向更轻的一档，发现复杂度超预期再升级：

```mermaid
flowchart TB
    Dev["/dev &lt;任务&gt;"] --> Load["加载上下文：CLAUDE.md + 触及模块的 guide + 扫一眼 pitfalls"]
    Load --> Judge{"判定复杂度"}
    Judge -- "简单<br/>单文件·改动明确·低风险" --> Direct["直接做<br/>完事跑测试 + lint"]
    Judge -- "中等<br/>多文件·需先想清楚" --> Plan["Plan 模式<br/>先列方案，确认后实现"]
    Judge -- "复杂<br/>新功能/跨模块·需可追溯" --> PRP

    subgraph PRP["PRP 四阶段 (产物落 PRP/&lt;feature&gt;/，可版本控制·可审·可验)"]
        direction LR
        S1["/refine-prd<br/>模糊需求 → 结构化 PRD"] --> S2["/generate-prp<br/>生成 PRP<br/>(强制读模块文档+pitfalls+规则)"]
        S2 --> S3["/validate-prp<br/>执行前逐项校验清单"]
        S3 --> S4["/execute-prp<br/>执行 + 跑测试 + 沉淀文档与教训"]
    end

    Direct --> Done(["完成：接口变了就 /generate-doc sync；有新教训就 /learn"])
    Plan --> Done
    PRP --> Done
```

**Plan 模式 vs PRP** 的区别：Plan 是「想清楚再做」的会话内临时计划，适合中等任务；PRP 是「想清楚、写下来、审完再做、做完验证、沉淀知识」的持久化流程，产物可版本控制，适合复杂功能。`/generate-prp` 这一步**强制**读相关模块文档 + pitfalls + 规则——把「先看约束再动手」固化进流程，而不是寄望 Agent 记得。

## 八、进化层：Harness 自己也在进化（流程图）

Harness 不是搭完就不动，它要能自我体检、自我改进。核心是 `/learn`——把会话里的纠错/反馈/新约定沉淀成**可复用资产**。沉淀位置按一条优先级路由：

```mermaid
flowchart TB
    L["/learn 提炼教训<br/>(现象 + 根因 + 正确做法)"] --> T{"教训属于哪类?"}
    T -- "高频·可正则检测的违规" --> P1["① 程序化：加一条 project-lint 规则<br/>(改 rules.json，跑样例验证正报/反不误报)"]
    T -- "项目层面的坑" --> P2["② 文档：pitfalls.md 追加一条"]
    T -- "用户偏好 / 项目动态" --> P3["③ 记忆：全局 ~/.claude/.../memory/"]
    T -- "模块知识更新" --> P4["对应模块三件套 / generate-doc sync"]

    P1 -. "优先级：程序化 > 文档 > 记忆" .-> P2
    P2 -. "越靠前越能「机制大于自觉」" .-> P3
```

为什么是「程序化 > 文档 > 记忆」这个优先级？因为越靠前的形式越**不依赖 Agent 自觉**：lint 规则会强制执行，文档要 Agent 主动读，记忆只是偏好提示。能机械检测的坑，就升级成 lint 规则，让它「这次错、下次也错不了」。

配套还有两件自检/回归工具：

- **`/gc`**（跑 `gc_scan.py`）：体检 harness 自身健康度——markdown 链接失效、`modules.json` 目录缺失、`settings.json` 引用的 hook 脚本缺失。
- **`evals/`**：给 AI 行为写的「单元测试」。lint 保「单次改动对」，eval 保「整套规则能让 AI 一次做对」，两者不重复。

## 九、把图串起来：一个真实编辑回合

最后用一张端到端流程图，把前面各层的机制在「Agent 改 `src/memory/` 里一个文件」这个真实回合里串起来——你会看到五层是如何协同的：

```mermaid
flowchart TB
    A(["/dev: 给记忆层加一个写入方法"]) --> B["编排层：判定复杂度 → 走 Plan / PRP"]
    B --> C["PreToolUse 触发 knowledge-routing.py<br/>注入 memory-module-guide + memory-rules"]
    C --> D["知识层：Agent 读到「写入必须在任务完成节点 + 显式 scope」"]
    D --> E["Agent 写入文件 (能力层工具)"]
    E --> F["PostToolUse：post-edit 格式化 → lint.py 检查"]
    F --> G{"记忆 write 缺 scope?<br/>Agent 直连 Neo4j?"}
    G -- "命中违规" --> H["lint exit 2：行号+fix+ref 反馈"] --> E
    G -- "干净" --> I["doom-loop 计数 (反复试错才预警)"]
    I --> J["复杂改动：code-reviewer 子代理宏观审查<br/>记忆时机 / 层越界 / 节点契约"]
    J --> K["Stop：stop-check 收尾 (残留断点?)"]
    K --> L["有新教训 → /learn 沉淀 → 升级 lint 规则 / pitfalls"]
    L --> M(["下次同类坑被机制挡在门外"])
```

这张图就是整套 Harness 的「价值闭环」：**知识层让它知道**、**策略层逼它做到**、**能力层让它够得着**、**编排层让它有章法**、**进化层让今天的教训变成明天的护栏**。

## 十、心法小结：什么照搬、什么替换

如果你想给自己的项目搭一套同款，记住哪些是**领域无关**（直接复用）、哪些**领域相关**（按项目替换）：

| 直接复用（领域无关） | 按你的项目替换（领域相关） |
| --- | --- |
| 五层目录骨架 | 能力层技能（本仓库 = run-graph / db-shell） |
| CLAUDE.md 拆分方式（核心 + 索引） | 规则内容（本仓库 = Python + 记忆约束） |
| 渐进式加载 L1→L3 | `project-lint/rules.json` 的具体规则 |
| 规则 frontmatter 机制 | 模块三件套的对象 |
| 数据驱动 lint 引擎 | CLAUDE.md 的硬红线 |
| Hook 生命周期 + 守卫 | —— |
| PRP 四阶段 / 进化层 / code-reviewer | 复用宿主全局资产，不重复造 |

最后留三句作为「心法」：

1. **上下文是稀缺资源**——能不加载就不加载，按需、渐进、最相关优先。
2. **机制大于自觉**——能用 hook/lint 强制的，绝不靠 Agent 记得。
3. **教训要沉淀成资产**——优先沉淀成可执行的程序（lint 规则），其次文档，最后记忆。

> 这是一套**「右尺寸的种子」**：不追求一次复刻成熟 harness 的全部资产，而是覆盖五层骨架，随真实代码逐步充实。`src/` 目前为空，但骨架已经准备好接住每一行未来的代码。

---

*本文基于该 harness 仓库当前状态绘制（2026-06-25），所有流程图均对应实际的钩子与引擎实现。*
