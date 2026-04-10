// 评测集数据恢复脚本
// 在浏览器控制台中执行此代码恢复默认数据

const EVAL_SET_STORAGE_KEY = "evaluation_sets_demo_v4";

const demoCases = [
  { id: 1, name: "金事通APP下载咨询", content: "你好，我这个是需要重新下载一个金事通app吗？", product: "", history: "", images: [], reference_output: "-" },
  { id: 2, name: "二维码识别咨询", content: "-", product: "", history: "", images: ["https://placehold.co/80x60/e2e8f0/64748b?text=QR"], reference_output: "-" },
  { id: 3, name: "超级玛丽9号投保咨询", content: "有这个情况还可以投保超级玛丽9号防癌吗", product: "超级玛丽9号防癌险", history: "已有2轮对话", images: ["https://placehold.co/80x60/e2e8f0/64748b?text=Doc1", "https://placehold.co/80x60/e2e8f0/64748b?text=Doc2"], reference_output: "-" }
];

function generateId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function nowString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const defaultEvalSet = {
  id: generateId("set"),
  name: "手小保的评测集",
  type: "app",
  projectApp: "咔嚓保-手小保/手小保",
  targetName: "手小保",
  objectLabel: "手小保",
  desc: "手小保智能助手评测",
  owners: "wisewong,martin",
  updated: nowString(),
  cases: JSON.parse(JSON.stringify(demoCases)),
  tasks: []
};

// 创建默认任务
const allCaseIds = defaultEvalSet.cases.map(c => c.id);
defaultEvalSet.tasks.push({
  id: generateId("task"),
  name: "全部用例",
  caseIds: allCaseIds,
  createdAt: nowString(),
  stats: { runRate: 0, checkRate: 0, avgScore: 0 }
});

// 保存到 LocalStorage
const sets = [defaultEvalSet];
localStorage.setItem(EVAL_SET_STORAGE_KEY, JSON.stringify(sets));

console.log("✅ 评测集数据已恢复！");
console.log("📊 评测集名称:", defaultEvalSet.name);
console.log("📝 用例数量:", defaultEvalSet.cases.length);
console.log("📋 任务数量:", defaultEvalSet.tasks.length);
console.log("🔄 请刷新页面查看恢复的数据");
