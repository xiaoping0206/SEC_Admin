# CLAUDE.md — 老年福利护理匹配应用 v2

> Claude Code 每次会话自动读取的项目上下文。
> 修改结构/数据库模式时，必须同步更新本文件。

---

## 项目概述

| 项目 | 内容 |
|------|------|
| 应用名称 | 老年福利护理匹配系统 |
| 一期平台 | 微信小程序 |
| 二期平台 | iOS App（App Store）— 一期完成后迁移 |
| 框架 | uni-app（Vue 3 Composition API） |
| UI 组件库 | uView Plus（Vue3） |
| 后端 | uniCloud 阿里云 Serverless |
| 认证 | uni-id-pages（微信 openid → iOS Apple Login 并行计划） |
| 状态管理 | Pinia |
| 样式 | SCSS + /styles/variables.scss 设计令牌 |
| 构建/运行 | HBuilderX → 微信开发者工具 |
| AI 工具 | Claude Code（架构/设计/审查）+ Cursor（实现） |
| 设计 | Figma → Figma MCP → uni-app 组件转换 |

---

## 应用核心功能

实现老人（Taker）与护理人员（Giver）之间的**四维度适配度匹配**。

| 维度 | 依据 | 权重 |
|------|------|------|
| 性格节奏适配度 | 五行（水/木/火/土/金） | 40% |
| 行为沟通适配度 | MBTI（4维度规则 + 12项修正项） | 25% |
| 生活环境适配度 | 标签重叠率（4类别 36项目） | 20% |
| 情绪互动适配度 | 四象/星座（火/土/气/水） | 15% |

```
总分 = 五行×0.40 + MBTI×0.25 + 环境×0.20 + 四象×0.15
等级：S（90分~）/ A（75分~）/ B（60分~）/ C（45分~）/ D（~44分）
保留小数点后1位四舍五入（例：86.4分）
```

### 匹配规则原始文件
- 文件：`match_rules_v2.xlsx`（7个工作表已完成）
- 工作表：`wuxing_rules`（25行）/ `sixiang_rules`（16行）/
          `mbti_dimension_rules`（16行）/ `mbti_modifier_rules`（12行）/
          `env_items`（36项目）/ `env_score_rules`（5区间）/ `match_config`
- JSON 转换及数据库导入：**STEP 7 进行**

### 生活环境评分公式
```
重叠率 = 重叠的 item_code 数量 / min(老人选择数, 护理员选择数)
区间分数：0.80↑→100 / 0.60↑→85 / 0.40↑→70 / 0.20↑→50 / 0.00↑→30
环境总分 = 爱好×0.25 + 生活方式×0.30 + 性格×0.25 + 沟通方式×0.20
类别内权重参考 match_config.env_weight_* 字段
```

---

## 开发阶段现状

```
✅ 已完成
  - HBuilderX 项目创建 + uniCloud 阿里云连接
  - 预览/调试测试
  - match_rules_v2.xlsx 完成（7个工作表，含生活环境）
  - CLAUDE.md / .cursorrules 编写

🔲 待进行顺序
  STEP 1  Claude Code  项目分析 & CLAUDE.md 确认
  STEP 2  Claude Code  完整文件夹/文件结构生成
  STEP 3  Claude Code  数据库模式 4个文件生成
  STEP 4  Claude Code  云函数骨架生成
  ★ FA   Figma        全屏设计（基准 375×812px）
  ★ FB   Figma MCP    提取设计令牌 → variables.scss
  STEP 5  Cursor       逐页面实现（参考 Figma URL/截图）
  STEP 6  Cursor       Cloud Object 逻辑实现
  STEP 7  协作         匹配规则 JSON 转换 + 匹配引擎完成
  STEP 8  协作         iOS 迁移 & App Store 提交
```

---

## 目录结构

```
/
├── CLAUDE.md
├── .cursorrules
├── manifest.json
├── pages.json
├── App.vue / main.js
├── styles/
│   └── variables.scss              # Figma 设计令牌
├── pages/
│   ├── index/index.vue
│   ├── auth/login.vue
│   ├── taker/
│   │   ├── list.vue / detail.vue / form.vue / matching.vue
│   ├── giver/
│   │   ├── list.vue / detail.vue / form.vue
│   ├── matching/
│   │   ├── index.vue / result.vue
│   └── admin/
│       ├── upload-rules.vue / version-list.vue
├── components/
│   ├── common/
│   │   ├── CareScoreBar.vue        # 四维度分数可视化条
│   │   ├── UserCard.vue / MatchTag.vue / EmptyState.vue
│   ├── taker/
│   │   ├── TakerCard.vue / TakerProfileForm.vue
│   └── giver/
│       ├── GiverCard.vue / GiverProfileForm.vue
├── store/
│   └── user.js / taker.js / giver.js / matching.js
├── utils/
│   └── request.js / validate.js / format.js
└── uniCloud/
    ├── cloudfunctions/
    │   ├── taker-manager/index.obj.js
    │   ├── giver-manager/index.obj.js
    │   ├── match-engine/index.js
    │   └── upload-matching-rules/index.obj.js
    └── database/
        ├── taker.schema.json
        ├── giver.schema.json
        ├── matching_rule_versions.schema.json
        └── matching_results.schema.json
```

---

## 数据库模式核心字段

### taker（老人）
```
name（必填）/ age / gender（male|female）/ contact / care_level（1~5）
wuxing：water|wood|fire|earth|metal
sixiang：fire|earth|air|water
mbti：String（ENFJ 等 16种）
env_tags：{ hobby:[], lifestyle:[], personality:[], comm_style:[] }
notes / is_matched:false / is_deleted:false
create_date / update_date（Unix 毫秒时间戳）
```

### giver（护理员）
```
name（必填）/ age / gender / qualification / experience_years
available_areas:[] / wuxing / sixiang / mbti / env_tags（与 taker 相同）
max_taker_count:5 / current_taker_count:0
is_deleted:false / create_date / update_date
```

### matching_rule_versions
```
version / description / is_active:Boolean
weights：{ w_wuxing:0.40, w_mbti:0.25, w_env:0.20, w_sixiang:0.15 }
rules：{ wuxing:[], sixiang:[], mbti_dimension:[], mbti_modifier:[], env_items:[], env_score:[] }
uploaded_by / upload_date / file_name
```

### matching_results
```
taker_id / giver_id / rule_version / rule_version_id
scores：{ wuxing_score, sixiang_score, mbti_score, env_score }
total_score / match_grade（S|A|B|C|D）
matched_date / status（active|ended）
```

---

## 云函数结构

| 文件 | 类型 | 方法 |
|------|------|------|
| taker-manager | Cloud Object | getTakerList / getTakerDetail / addTaker / updateTaker / deleteTaker |
| giver-manager | Cloud Object | getGiverList / getGiverDetail / addGiver / updateGiver / deleteGiver |
| upload-matching-rules | Cloud Object | uploadRules / getRuleVersionList / activateVersion / getRuleVersionDetail |
| match-engine | Cloud Function | exports.main({ takerId }) |

---

## 开发环境职责分工

| 工具 | 职责 | 备注 |
|------|------|------|
| Claude Code（Mac 应用） | 架构设计 / 文件生成 / 代码审查 | 同文件夹同时打开 ✅ |
| Cursor（Mac 应用） | 页面实现 / 逻辑编码 | 同文件夹同时打开 ✅ |
| HBuilderX | 专用构建/运行 | 禁止编辑代码，常驻后台运行 |
| Figma | 界面设计 | STEP 4 完成后进入，通过 MCP 连接 |

> ⚠️ 同一文件不得在两个工具中同时编辑。

---

## iOS 迁移计划（STEP 8）

```
需要修改（约 10~20%）：
  · 登录：必须新增 Apple Login（App Store 政策要求）
  · 平台分支：#ifdef APP-PLUS / MP-WEIXIN 条件编译

无需修改（约 80~90%）：
  · 全部 uniCloud / 匹配引擎 / 业务逻辑
  · uView Plus / Pinia / SCSS / 数据库模式

构建：HBuilderX → 发行 → 原生App-云打包（无需 Mac，可云端构建）
审核：Apple Developer Program $99/年，审核周期 1~3 天
```

---

## 绝对禁止

```
❌ wx.* API            → 只使用 uni.*（iOS 迁移必要条件）
❌ 平台分支时使用原始 if  → 只使用 #ifdef 条件编译
❌ 在客户端计算匹配分数   → 由 match-engine Cloud Function 专门负责
❌ 数据库物理删除         → 使用 is_deleted:true 软删除
❌ Options API           → 只使用 <script setup> Vue3
❌ 个人信息包含在 URL 参数中
❌ 生产代码中残留 console.log
```

## 返回值规范

```js
{ code: 0, msg: 'success', data: {} }                           // 成功
throw new Error(JSON.stringify({ code: -1000, msg: '...' }))    // 失败

// 错误代码：-1000 参数错误 / -1001 数据不存在
//           -1002 权限不足 / -2001 匹配失败
```
