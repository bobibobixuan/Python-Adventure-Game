// Admin Panel - 题库导入
function showAdminPanel() {
    if (!API.isLoggedIn()) {
        alert('请先登录管理员账号');
        return;
    }

    const existingPanel = document.getElementById('adminImportPanel');
    if (existingPanel) {
        existingPanel.remove();
        return;
    }

    const panel = document.createElement('div');
    panel.id = 'adminImportPanel';
    panel.innerHTML = `
        <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;">
            <div style="background:#fff;border-radius:16px;padding:30px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;color:#333;">
                <h2 style="margin:0 0 10px 0;">📥 题库导入</h2>
                <p style="color:#999;margin:0 0 20px 0;font-size:0.9em;">
                    上传符合格式规范的 JSON 文件。格式详见
                    <a href="#" onclick="event.preventDefault();alert('请查看 docs/题库导入格式规范.md')">导入规范</a>
                </p>

                <div style="border:2px dashed #ccc;border-radius:12px;padding:40px 20px;text-align:center;margin-bottom:20px;cursor:pointer;"
                     id="dropZone"
                     onclick="document.getElementById('importFileInput').click()">
                    <div style="font-size:2em;">📁</div>
                    <div style="margin-top:8px;color:#999;" id="dropText">点击选择文件或拖拽到此处</div>
                </div>
                <input type="file" id="importFileInput" accept=".json" style="display:none;"
                       onchange="handleImportFile(this.files[0])">

                <div id="importPreview" style="display:none;margin-bottom:20px;">
                    <div style="background:#f0f7ff;border-radius:8px;padding:12px;margin-bottom:10px;">
                        <strong id="previewUnit"></strong>
                        <span style="color:#999;margin-left:8px;" id="previewCount"></span>
                    </div>
                    <div id="previewQuestions" style="max-height:200px;overflow-y:auto;font-size:0.85em;"></div>
                </div>

                <div id="importResult" style="display:none;margin-bottom:15px;"></div>

                <div style="display:flex;gap:10px;justify-content:flex-end;">
                    <button onclick="document.getElementById('adminImportPanel').remove()"
                            style="padding:10px 20px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer;">
                        关闭
                    </button>
                    <button id="importSubmitBtn" onclick="doImport()" disabled
                            style="padding:10px 20px;border:none;border-radius:8px;background:#667eea;color:#fff;cursor:pointer;">
                        开始导入
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    // 拖拽支持
    const dropZone = panel.querySelector('#dropZone');
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#667eea'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#ccc'; });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ccc';
        const file = e.dataTransfer.files[0];
        if (file) handleImportFile(file);
    });
}

let pendingImportData = null;

function handleImportFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.version || !data.unit || !Array.isArray(data.questions)) {
                throw new Error('格式不符合规范：需要 version, unit, questions 字段');
            }
            pendingImportData = data;

            document.getElementById('dropText').textContent = file.name;
            document.getElementById('importPreview').style.display = 'block';
            document.getElementById('previewUnit').textContent = '📚 ' + data.unit;
            document.getElementById('previewCount').textContent = data.questions.length + ' 题';

            const preview = document.getElementById('previewQuestions');
            preview.innerHTML = data.questions.slice(0, 5).map((q, i) =>
                `<div style="padding:6px 0;border-bottom:1px solid #eee;">
                    ${i+1}. [${q.type}] ${q.content.substring(0, 50)}${q.content.length > 50 ? '...' : ''}
                </div>`
            ).join('') + (data.questions.length > 5 ?
                `<div style="color:#999;padding:6px 0;">... 还有 ${data.questions.length - 5} 题</div>` : '');

            document.getElementById('importSubmitBtn').disabled = false;
        } catch (err) {
            alert('文件解析失败：' + err.message);
        }
    };
    reader.readAsText(file);
}

async function doImport() {
    if (!pendingImportData) return;
    const btn = document.getElementById('importSubmitBtn');
    btn.disabled = true;
    btn.textContent = '导入中...';

    const resultDiv = document.getElementById('importResult');
    try {
        const result = await API.importQuestions(pendingImportData);
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<div style="background:#e8f5e9;color:#2e7d32;padding:12px;border-radius:8px;">
            ✅ ${result.message}
        </div>`;
        pendingImportData = null;
        document.getElementById('importSubmitBtn').style.display = 'none';
    } catch (err) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<div style="background:#ffebee;color:#c62828;padding:12px;border-radius:8px;">
            ❌ ${err.message}
        </div>`;
        btn.disabled = false;
        btn.textContent = '重试导入';
    }
}
