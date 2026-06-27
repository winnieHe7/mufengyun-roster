# 牟凤云团队花名册系统

## 技术栈
- Vite + React 18 + Tailwind CSS
- Supabase（后端数据库 + 认证）
- Vercel（部署）

## 本地开发

```bash
npm install
npm run dev          # 开发服务器 http://localhost:5173
npm run build        # 生产构建
```

## 上线部署指南（3步）

### 第1步：创建 Supabase 项目

1. 访问 https://supabase.com 注册并创建新项目
2. 进入项目设置 > API，获取：
   - **Project URL**（如 `https://xxxxx.supabase.co`）
   - **anon public key**
3. 进入 SQL Editor，执行 `supabase/schema.sql` 创建数据库表
4. 在项目根目录创建 `.env` 文件：
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. 导入初始数据：`npm run import-data`

### 第2步：部署到 Vercel

1. 将代码推送到 GitHub
2. 访问 https://vercel.com，用 GitHub 登录
3. 点击 "New Project" → 选择仓库 → Import
4. Framework Preset 自动识别为 Vite
5. 在 Environment Variables 中添加：
   - `VITE_SUPABASE_URL` = 你的 Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = 你的 anon key
6. 点击 Deploy，等待 1-2 分钟
7. 部署完成后获得免费域名：`https://your-project.vercel.app`

### 第3步：搜索引擎收录

1. **Google 收录**：
   - 访问 https://search.google.com/search-console
   - 添加你的 Vercel 域名
   - 提交 sitemap：`https://your-domain/sitemap.xml`

2. **百度收录**：
   - 访问 https://ziyuan.baidu.com
   - 添加站点 → 验证域名
   - 提交 sitemap

3. robots.txt 和 sitemap.xml 已自动配置在 `public/` 目录

## 管理员账号
- 默认账号：`admin`
- 默认密码：`admin123`
- ⚠️ 上线后请立即在管理后台修改密码

## 功能清单
- 花名册浏览与多维度筛选（年级/学历/城市/行业/状态）
- 学生详情查看（联系方式按隐私设置分级）
- 管理员账号分发系统（创建/删除/重置密码）
- 个人中心（信息编辑、隐私设置、完善度）
- 数据统计分析（柱状图/饼图）
- CSV 数据导出
- 导师简介 + 团队简介
- 响应式设计（移动端适配）
- SEO 优化（meta/OG/robots/sitemap）
