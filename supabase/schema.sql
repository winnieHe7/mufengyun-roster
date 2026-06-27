-- ============================================================
-- 牟凤云团队花名册 · Supabase 数据库 Schema
-- 在 Supabase SQL Editor 中执行此文件
-- ============================================================

-- 1. 学生花名册表
CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT DEFAULT '男',
  ethnicity TEXT DEFAULT '汉族',
  hometown TEXT DEFAULT '',
  enroll_year INTEGER,
  graduate_year INTEGER,
  status TEXT DEFAULT '在读',
  degree TEXT DEFAULT '研究生',
  major TEXT DEFAULT '',
  company TEXT DEFAULT '',
  industry TEXT DEFAULT '',
  city TEXT DEFAULT '',
  position TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 管理员分发的账号表
CREATE TABLE IF NOT EXISTS accounts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'student',
  degree TEXT DEFAULT '研究生',
  enroll_year INTEGER,
  graduate_year INTEGER,
  hometown TEXT DEFAULT '',
  major TEXT DEFAULT '',
  city TEXT DEFAULT '',
  email TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 隐私设置表
CREATE TABLE IF NOT EXISTS privacy_settings (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  show_phone BOOLEAN DEFAULT true,
  show_email BOOLEAN DEFAULT true,
  show_company BOOLEAN DEFAULT true,
  UNIQUE(student_id)
);

-- 4. 站点配置表
CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 插入默认管理员账号（密码: admin123）
INSERT INTO accounts (name, phone, password, role) 
VALUES ('管理员', 'admin', 'admin123', 'admin')
ON CONFLICT (phone) DO NOTHING;

-- 6. 插入默认站点配置
INSERT INTO site_config (key, value) VALUES
  ('announcement', '欢迎访问牟凤云团队花名册系统'),
  ('registration_open', 'false'),
  ('export_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- 7. 开启 RLS（行级安全）
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- 8. RLS 策略
-- students: 所有人可读（公开信息），仅登录用户可写
CREATE POLICY "students_read_all" ON students FOR SELECT USING (true);
CREATE POLICY "students_write_authenticated" ON students FOR ALL 
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- accounts: 仅管理员可读写
CREATE POLICY "accounts_admin_all" ON accounts FOR ALL 
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- privacy_settings: 所有人可读，登录用户可写自己的
CREATE POLICY "privacy_read_all" ON privacy_settings FOR SELECT USING (true);
CREATE POLICY "privacy_write_owner" ON privacy_settings FOR ALL 
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- site_config: 所有人可读，仅管理员可写
CREATE POLICY "config_read_all" ON site_config FOR SELECT USING (true);
CREATE POLICY "config_write_admin" ON site_config FOR ALL 
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 9. 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 10. 创建索引
CREATE INDEX IF NOT EXISTS idx_students_enroll_year ON students(enroll_year);
CREATE INDEX IF NOT EXISTS idx_students_degree ON students(degree);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_city ON students(city);
CREATE INDEX IF NOT EXISTS idx_students_industry ON students(industry);
CREATE INDEX IF NOT EXISTS idx_accounts_phone ON accounts(phone);
