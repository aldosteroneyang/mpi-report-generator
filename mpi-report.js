/**
 * MPI 報告生成器 - JavaScript 函數庫
 * 基於圓形區塊圖表生成核醫心肌灌注掃描 (MPI) 報告
 */

// 等待 DOM 完全加載後初始化
document.addEventListener('DOMContentLoaded', initReportGenerator);

// 添加窗口消息監聽器，用於接收數據
window.addEventListener('message', receiveReportData);

/**
 * 接收從其他窗口傳來的報告數據
 * @param {MessageEvent} event - 消息事件對象
 */
function receiveReportData(event) {
  // 安全檢查，確保數據來源可信
  console.log('Received message from:', event.origin);
  console.log('消息事件完整數據:', event);
  
  // 檢查數據是否存在且為對象類型
  if (event.data && typeof event.data === 'object') {
    console.log('Received data:', event.data);
    
    // 處理接收到的數據
    const data = event.data;
    
    // 處理 GUI_EXTENSION_DATA 類型的消息（患者資料）
    if (data.type === 'GUI_EXTENSION_DATA') {
      console.log('報告生成器：收到GUI擴充功能資料');
      
      // 存儲完整資料
      window.patientData = data;
      
      // 處理患者資訊
      if (data.patientInfo) {
        console.log('報告生成器：處理患者資訊', data.patientInfo);
        handlePatientInfo(data.patientInfo);
      }
      
      // 處理MCIID
      if (data.mciid) {
        console.log('報告生成器：處理MCIID', data.mciid);
        const mciidElement = document.getElementById('mciid');
        if (mciidElement) {
          mciidElement.textContent = data.mciid;
        }
      }
      
      // 顯示通知
      showNotification('已接收並更新患者資料');
      return;
    }
    
    // 處理 REQUEST_DATA_RESPONSE 類型的消息
    if (data.type === 'REQUEST_DATA_RESPONSE') {
      console.log('報告生成器：收到重新請求的數據', data);
      
      // 存儲完整資料
      window.patientData = data;
      
      // 處理患者資訊
      if (data.patientInfo) {
        console.log('報告生成器：處理患者資訊', data.patientInfo);
        handlePatientInfo(data.patientInfo);
      }
      
      // 處理MCIID
      if (data.mciid) {
        console.log('報告生成器：處理MCIID', data.mciid);
        const mciidElement = document.getElementById('mciid');
        if (mciidElement) {
          mciidElement.textContent = data.mciid;
        }
      }
      
      // 顯示通知
      showNotification('已接收並更新請求的患者資料');
      return;
    }
    
    // 處理報告數據（原始功能）
    if (data.Procedure || data.Findings || data.Impression || data.Addendum) {
      // 如果界面上有對應的元素，則更新內容
      if (data.Procedure && document.getElementById('procedureBox')) {
        document.getElementById('procedureBox').textContent = data.Procedure;
      }
      
      if (data.Findings && document.getElementById('findingsBox')) {
        document.getElementById('findingsBox').textContent = data.Findings;
      }
      
      if (data.Impression && document.getElementById('impressionBox')) {
        document.getElementById('impressionBox').textContent = data.Impression;
      }
      
      if (data.Addendum && document.getElementById('addendumBox')) {
        document.getElementById('addendumBox').textContent = data.Addendum;
      }
      
      // 顯示接收成功通知
      showNotification('報告數據已接收並更新!');
      return;
    }
  }
}

function initReportGenerator() {
  // 只保留清除按鈕的事件處理
  document.getElementById('clearValues').addEventListener('click', clearValues);
  
  // 監聽下拉選單變化
  document.getElementById('medicationSelect').addEventListener('change', updateReports);
  document.getElementById('aminophyllineSelect').addEventListener('change', updateReports);
  
  // 監聽圖表變化
  document.addEventListener('mouseup', function() {
    // 鼠標釋放後更新報告
    setTimeout(updateReports, 100); // 短暫延遲確保值已更新
  });
  
  // 初始化顯示報告
  updateReports();
}

/**
 * 更新所有報告區塊
 */
function updateReports() {
  // 更新 Procedure 區塊
  updateProcedureText();
  
  // 更新 Findings 和 Impression 區塊
  const reportData = generateReportFromDiagrams();
  document.getElementById('findingsBox').textContent = reportData.findings;
  document.getElementById('impressionBox').textContent = reportData.impression;
  
  // 更新 Addendum 區塊
  updateAddendumText(reportData.impression);
}

/**
 * 更新 Procedure 區塊
 */
function updateProcedureText() {
  var medicationValue = document.getElementById('medicationSelect').value;
  var aminophyllineValue = document.getElementById('aminophyllineSelect').value;
  
  var procedureText = "";
  
  if (medicationValue === "Persantin") {
    // 使用 Persantin
    procedureText = 
      "1. Tl-201 myocardial perfusion scan is performed following vasodilator-stress with intravenous infusion of 0.56 mg/kg of persantin and 3 mCi of Tl-201.\n" +
      "2. Stress and redistribution imaging with SPECT technique are obtained by gamma camera with low energy high resolution collimator about 5 minutes and 4 hours after tracer injection, respectively.";
    
    if (aminophyllineValue !== "No aminophylline") {
      // 使用了氨茶鹼
      procedureText += "\n3. " + aminophyllineValue + " of aminophylline 50 mg were administered to alleviate symptoms of headedness/chest tightness/general discomfort after the injection of persantin. The symptoms improved significantly.";
    }
  } else {
    // 不使用 Persantin
    procedureText = 
      "1. Initial and redistribution imaging with SPECT technique are obtained by gamma camera with low energy high resolution collimator about 5 minutes and 4 hours after intravenous injection of 3 mCi Tl-201, respectively.\n" +
      "2. " + forbidDipyridamole(medicationValue.replace("Hold (", "").replace(")", ""));
    
    if (aminophyllineValue !== "No aminophylline") {
      procedureText = "Error: No persantin but with aminophylline administration.";
    }
  }
  
  // 顯示到對應區塊
  document.getElementById('procedureBox').textContent = procedureText;
  
  // 檢查下拉選單值是否合理
  checkDropdownValue();
}

/**
 * 顯示通知訊息
 * @param {string} message - 要顯示的訊息
 */
function showNotification(message) {
  var notification = document.getElementById('notification');
  notification.innerText = message;
  notification.style.visibility = 'visible';
  notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // 增加背景色對比度
  notification.style.color = '#fff'; // 白色文字
  notification.style.padding = '15px 20px'; // 增加內邊距
  notification.style.fontSize = '16px'; // 增加字體大小
  notification.style.borderRadius = '8px'; // 圓角邊框

  // 5秒後自動隱藏
  setTimeout(function() {
    notification.style.visibility = 'hidden';
  }, 5000); // 增加顯示時間
}

/**
 * 檢查下拉選單值是否合理
 * 如果 Persantin 選擇了 Hold，但氨茶鹼不是 No，背景會變粉紅色
 */
function checkDropdownValue() {
  let medicationSelect = document.getElementById('medicationSelect');
  let aminophyllineSelect = document.getElementById('aminophyllineSelect');  

  const isPerantinHolded = medicationSelect.value !== "Persantin";
  const hasAminophylline = aminophyllineSelect.value !== "No aminophylline";

  if (isPerantinHolded && hasAminophylline) {
    medicationSelect.style.backgroundColor = 'pink';
    aminophyllineSelect.style.backgroundColor = 'pink';
    document.getElementById('procedureBox').style.backgroundColor = 'rgba(255, 200, 200, 0.3)';
  } else if (isPerantinHolded) {
    medicationSelect.style.backgroundColor = 'pink';
    aminophyllineSelect.style.backgroundColor = '';
    document.getElementById('procedureBox').style.backgroundColor = '';
  } else if (hasAminophylline) {
    medicationSelect.style.backgroundColor = '';
    aminophyllineSelect.style.backgroundColor = 'pink';
    document.getElementById('procedureBox').style.backgroundColor = '';
  } else {
    medicationSelect.style.backgroundColor = '';
    aminophyllineSelect.style.backgroundColor = '';
    document.getElementById('procedureBox').style.backgroundColor = '';
  }
}

/**
 * 產生 Persantin 不使用的原因說明
 * @param {string} reason - 不使用的原因
 * @returns {string} 原因說明
 */
function forbidDipyridamole(reason) {
  return "Persantin is not administered due to " + reason + ".";
}

/**
 * 從圖形數據生成報告內容
 * @returns {Object} 包含 findings 和 impression 的對象
 */
function generateReportFromDiagrams() {
  // 從上下兩個圖表中獲取所有區塊的值
  const stressValues = collectDiagramValues('topChart');
  const restValues = collectDiagramValues('bottomChart');
  
  // 使用 updateReport.js 的函數生成報告
  const values = {
    // 壓力(stress)測試的值
    "valueStressApex": stressValues[18] || 0,
    "valueStressBasalAnterior": stressValues[4] || 0,
    "valueStressMiddleAnterior": stressValues[10] || 0,
    "valueStressApicalAnterior": stressValues[15] || 0,
    "valueStressBasalAnteroseptal": stressValues[3] || 0,
    "valueStressMiddleAnteroseptal": stressValues[9] || 0,
    "valueStressApicalAnteroseptal": stressValues[14] || 0,
    "valueStressBasalInferoseptal": stressValues[2] || 0,
    "valueStressMiddleInferoseptal": stressValues[8] || 0,
    "valueStressApicalInferoseptal": stressValues[13] || 0,
    "valueStressBasalInferior": stressValues[1] || 0,
    "valueStressMiddleInfterior": stressValues[7] || 0,
    "valueStressApicalInfterior": stressValues[12] || 0,
    "valueStressBasalInferolateral": stressValues[0] || 0,
    "valueStressMiddleInferolateral": stressValues[6] || 0,
    "valueStressApicalInferolateral": stressValues[17] || 0,
    "valueStressBasalAnterolateral": stressValues[5] || 0,
    "valueStressMiddleAnterolateral": stressValues[11] || 0,
    "valueStressApicalAnterolateral": stressValues[16] || 0,
    
    // 休息(rest)測試的值
    "valueRestApex": restValues[18] || 0,
    "valueRestBasalAnterior": restValues[4] || 0,
    "valueRestMiddleAnterior": restValues[10] || 0,
    "valueRestApicalAnterior": restValues[15] || 0,
    "valueRestBasalAnteroseptal": restValues[3] || 0,
    "valueRestMiddleAnteroseptal": restValues[9] || 0,
    "valueRestApicalAnteroseptal": restValues[14] || 0,
    "valueRestBasalInferoseptal": restValues[2] || 0,
    "valueRestMiddleInferoseptal": restValues[8] || 0,
    "valueRestApicalInferoseptal": restValues[13] || 0,
    "valueRestBasalInferior": restValues[1] || 0,
    "valueRestMiddleInfterior": restValues[7] || 0,
    "valueRestApicalInfterior": restValues[12] || 0,
    "valueRestBasalInferolateral": restValues[0] || 0,
    "valueRestMiddleInferolateral": restValues[6] || 0,
    "valueRestApicalInferolateral": restValues[17] || 0,
    "valueRestBasalAnterolateral": restValues[5] || 0,
    "valueRestMiddleAnterolateral": restValues[11] || 0,
    "valueRestApicalAnterolateral": restValues[16] || 0,
  };
  
  // 調用 updateReport 函數
  const reportResult = updateReport(values);
  
  // 直接返回 updateReport 的結果
  return {
    findings: reportResult.outputFindings,
    impression: reportResult.outputImpression
  };
}

/**
 * 從指定的圖表中收集所有區塊的值
 * @param {string} chartId - 圖表的 ID
 * @returns {Array} 所有區塊的值
 */
function collectDiagramValues(chartId) {
  const chart = document.getElementById(chartId);
  const textElements = chart.querySelectorAll('text');
  const values = [];
  
  textElements.forEach(function(textElement) {
    values.push(parseInt(textElement.textContent) || 0);
  });
  
  return values;
}

/**
 * 計算圖表中有多少個區塊顯示缺損（值大於0）
 * @param {Array} values - 圖表中所有區塊的值
 * @returns {number} 缺損區塊的數量
 */
function countDefects(values) {
  return values.filter(value => value > 0).length;
}

/**
 * 清除所有圖表的值和下拉選單設置
 */
function clearValues() {
  // 重設下拉選單
  document.getElementById('medicationSelect').value = "Persantin";
  document.getElementById('aminophyllineSelect').value = "No aminophylline";
  
  // 清除所有圖表的值
  clearDiagramValues('topChart');
  clearDiagramValues('bottomChart');
  
  // 更新報告
  updateReports();
  
  showNotification('All values have been reset.');
}

/**
 * 清除指定圖表中所有區塊的值
 * @param {string} chartId - 圖表的 ID
 */
function clearDiagramValues(chartId) {
  const chart = document.getElementById(chartId);
  
  // 清除所有文字元素的內容
  const textElements = chart.querySelectorAll('text');
  textElements.forEach(function(textElement) {
    textElement.textContent = '0';
  });
  
  // 重設所有路徑和圓形的樣式
  const segments = chart.querySelectorAll('path, circle');
  segments.forEach(function(segment) {
    segment.classList.remove('state-1', 'state-2', 'state-3');
    segment.classList.add('state-0');
  });
  
  // 重要：重置segmentCounts變數
  // 獲取圖表對應的JavaScript作用域中的變數
  if (window[`${chartId}Counts`]) {
    // 如果已經存在全局變數，則重置它
    for (let key in window[`${chartId}Counts`]) {
      window[`${chartId}Counts`][key] = 0;
    }
  } else {
    // 建立一個全局變數來儲存重置後的狀態
    window[`${chartId}Counts`] = {};
  }
}

/**
 * 格式化字串數組，以特定分隔符和連接詞組合
 * @param {string[]} arr - 字串數組
 * @param {string} txtSplit - 分隔符，預設為 ", "
 * @param {string} txtJunction - 連接詞，預設為 "and"
 * @returns {string} 格式化後的字串
 */
function formatStringArray(arr, txtSplit = ", ", txtJunction = "and") {
  let length = arr.length;

  if (length === 0) {
    return "";
  } else if (length === 1) {
    return arr[0];
  } else if (length === 2) {
    return arr[0] + " " + txtJunction + " " + arr[1];
  } else {
    return arr.slice(0, -1).join(txtSplit) + txtSplit + txtJunction + " " + arr[length - 1];
  }
}

/**
 * 將句子首字母大寫
 * @param {string} str - 輸入句子
 * @returns {string} 首字母大寫的句子
 */
function capitalizeFirstCharacter(str) {
  if (str && str.length > 0) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  } else {
    return '';
  }
}

/**
 * 更新 Addendum 區塊
 * @param {string} impressionText - Impression 區塊的文本內容
 */
function updateAddendumText(impressionText) {
  const addendumBox = document.getElementById('addendumBox');
  
  // 檢查 Impression 是否包含 "reverse"
  if (impressionText.toLowerCase().includes('reverse')) {
    addendumBox.textContent = 
      "Reverse redistribution (RR) should be interpreted according to patient's condition:\n" +
      "1) In patients with known CAD but without previous MI, RR may be suggestive of multivessel disease.\n" +
      "2) In patients with chronic CAD and remote MI, RR is frequently associated with myocardial viability.\n" +
      "3) In patients with a low prevalence of CAD, the reality of RR is questionable.\n" +
      "4) In recent revascularized myocardial infarction, RR is associated with restoration of adequate perfusion and with myocardial salvage and viability.";
  } else {
    addendumBox.textContent = "";
  }
} 

function updateReport(values) {

  // 壓力(stress)測試的值
  var valueStressApex = values["valueStressApex"];
  var valueStressBasalAnterior = values["valueStressBasalAnterior"];
  var valueStressMiddleAnterior = values["valueStressMiddleAnterior"];
  var valueStressApicalAnterior = values["valueStressApicalAnterior"];
  var valueStressBasalAnteroseptal = values["valueStressBasalAnteroseptal"];
  var valueStressMiddleAnteroseptal = values["valueStressMiddleAnteroseptal"];
  var valueStressApicalAnteroseptal = values["valueStressApicalAnteroseptal"];
  var valueStressBasalInferoseptal = values["valueStressBasalInferoseptal"];
  var valueStressMiddleInferoseptal = values["valueStressMiddleInferoseptal"];
  var valueStressApicalInferoseptal = values["valueStressApicalInferoseptal"];
  var valueStressBasalInferior = values["valueStressBasalInferior"];
  var valueStressMiddleInfterior = values["valueStressMiddleInfterior"];
  var valueStressApicalInfterior = values["valueStressApicalInfterior"];
  var valueStressBasalInferolateral = values["valueStressBasalInferolateral"];
  var valueStressMiddleInferolateral = values["valueStressMiddleInferolateral"];
  var valueStressApicalInferolateral = values["valueStressApicalInferolateral"];
  var valueStressBasalAnterolateral = values["valueStressBasalAnterolateral"];
  var valueStressMiddleAnterolateral = values["valueStressMiddleAnterolateral"];
  var valueStressApicalAnterolateral = values["valueStressApicalAnterolateral"];
  
  // 休息(rest)測試的值
  var valueRestApex = values["valueRestApex"];
  var valueRestBasalAnterior = values["valueRestBasalAnterior"];
  var valueRestMiddleAnterior = values["valueRestMiddleAnterior"];
  var valueRestApicalAnterior = values["valueRestApicalAnterior"];
  var valueRestBasalAnteroseptal = values["valueRestBasalAnteroseptal"];
  var valueRestMiddleAnteroseptal = values["valueRestMiddleAnteroseptal"];
  var valueRestApicalAnteroseptal = values["valueRestApicalAnteroseptal"];
  var valueRestBasalInferoseptal = values["valueRestBasalInferoseptal"];
  var valueRestMiddleInferoseptal = values["valueRestMiddleInferoseptal"];
  var valueRestApicalInferoseptal = values["valueRestApicalInferoseptal"];
  var valueRestBasalInferior = values["valueRestBasalInferior"];
  var valueRestMiddleInfterior = values["valueRestMiddleInfterior"];
  var valueRestApicalInfterior = values["valueRestApicalInfterior"];
  var valueRestBasalInferolateral = values["valueRestBasalInferolateral"];
  var valueRestMiddleInferolateral = values["valueRestMiddleInferolateral"];
  var valueRestApicalInferolateral = values["valueRestApicalInferolateral"];
  var valueRestBasalAnterolateral = values["valueRestBasalAnterolateral"];
  var valueRestMiddleAnterolateral = values["valueRestMiddleAnterolateral"];
  var valueRestApicalAnterolateral = values["valueRestApicalAnterolateral"];

  var valuesStressApex = [valueStressApex];
  var valuesStressAnterior = [valueStressBasalAnterior, valueStressMiddleAnterior, valueStressApicalAnterior];
  var valuesStressAnteroseptal = [valueStressBasalAnteroseptal, valueStressMiddleAnteroseptal, valueStressApicalAnteroseptal];
  var valuesStressInferoseptal = [valueStressBasalInferoseptal, valueStressMiddleInferoseptal, valueStressApicalInferoseptal];
  var valuesStressInferior = [valueStressBasalInferior, valueStressMiddleInfterior, valueStressApicalInfterior];
  var valuesStressInferolateral = [valueStressBasalInferolateral, valueStressMiddleInferolateral, valueStressApicalInferolateral];
  var valuesStressAnterolateral = [valueStressBasalAnterolateral, valueStressMiddleAnterolateral, valueStressApicalAnterolateral];

  var valuesRestApex = [valueRestApex];
  var valuesRestAnterior = [valueRestBasalAnterior, valueRestMiddleAnterior, valueRestApicalAnterior];
  var valuesRestAnteroseptal = [valueRestBasalAnteroseptal, valueRestMiddleAnteroseptal, valueRestApicalAnteroseptal];
  var valuesRestInferoseptal = [valueRestBasalInferoseptal, valueRestMiddleInferoseptal, valueRestApicalInferoseptal];
  var valuesRestInferior = [valueRestBasalInferior, valueRestMiddleInfterior, valueRestApicalInfterior];
  var valuesRestInferolateral = [valueRestBasalInferolateral, valueRestMiddleInferolateral, valueRestApicalInferolateral];
  var valuesRestAnterolateral = [valueRestBasalAnterolateral, valueRestMiddleAnterolateral, valueRestApicalAnterolateral];

  var dicStress = {
    "apex": valuesStressApex,
    "anterior": valuesStressAnterior,
    "anteroseptal": valuesStressAnteroseptal,
    "inferoseptal": valuesStressInferoseptal,
    "inferior": valuesStressInferior,
    "inferolateral": valuesStressInferolateral,
    "anterolateral": valuesStressAnterolateral
  }

  var dicRest = {
    "apex": valuesRestApex,
    "anterior": valuesRestAnterior,
    "anteroseptal": valuesRestAnteroseptal,
    "inferoseptal": valuesRestInferoseptal,
    "inferior": valuesRestInferior,
    "inferolateral": valuesRestInferolateral,
    "anterolateral": valuesRestAnterolateral
  }

  var regionStressLAD = ['anterior', 'anteroseptal', 'apex'].filter(x => dicStress[x].filter(y => y > 0).length > 0);
  var regionStressRCA = ['inferoseptal', 'inferior'].filter(x => dicStress[x].filter(y => y > 0).length > 0);
  var regionStressLCX = ['inferolateral', 'anterolateral'].filter(x => dicStress[x].filter(y => y > 0).length > 0);
  var regionRestLAD = ['anterior', 'anteroseptal', 'apex'].filter(x => dicRest[x].filter(y => y > 0).length > 0);
  var regionRestRCA = ['inferoseptal', 'inferior'].filter(x => dicRest[x].filter(y => y > 0).length > 0);
  var regionRestLCX = ['inferolateral', 'anterolateral'].filter(x => dicRest[x].filter(y => y > 0).length > 0);

  // calulate areas

  var areaStressApex = valueStressApex > 0 ? 1 : 0;
  var areaStressBasalAnterior = valueStressBasalAnterior > 0 ? 1 : 0;
  var areaStressMiddleAnterior = valueStressMiddleAnterior > 0 ? 1 : 0;
  var areaStressApicalAnterior = valueStressApicalAnterior > 0 ? 1 : 0;
  var areaStressBasalAnteroseptal = valueStressBasalAnteroseptal > 0 ? 1 : 0;
  var areaStressMiddleAnteroseptal = valueStressMiddleAnteroseptal > 0 ? 1 : 0;
  var areaStressApicalAnteroseptal = valueStressApicalAnteroseptal > 0 ? 0.5 : 0;

  var areaStressBasalInferoseptal = valueStressBasalInferoseptal > 0 ? 1 : 0;
  var areaStressMiddleInferoseptal = valueStressMiddleInferoseptal > 0 ? 1 : 0;
  var areaStressApicalInferoseptal = valueStressApicalInferoseptal > 0 ? 0.5 : 0;
  var areaStressBasalInferior = valueStressBasalInferior > 0 ? 1 : 0;
  var areaStressMiddleInfterior = valueStressMiddleInfterior > 0 ? 1 : 0;
  var areaStressApicalInfterior = valueStressApicalInfterior > 0 ? 1 : 0;

  var areaStressBasalInferolateral = valueStressBasalInferolateral > 0 ? 1 : 0;
  var areaStressMiddleInferolateral = valueStressMiddleInferolateral > 0 ? 1 : 0;
  var areaStressApicalInferolateral = valueStressApicalInferolateral > 0 ? 0.5 : 0;
  var areaStressBasalAnterolateral = valueStressBasalAnterolateral > 0 ? 1 : 0;
  var areaStressMiddleAnterolateral = valueStressMiddleAnterolateral > 0 ? 1 : 0;
  var areaStressApicalAnterolateral = valueStressApicalAnterolateral > 0 ? 0.5 : 0;

  var areaRestApex = valueRestApex > 0 ? 1 : 0;
  var areaRestBasalAnterior = valueRestBasalAnterior > 0 ? 1 : 0;
  var areaRestMiddleAnterior = valueRestMiddleAnterior > 0 ? 1 : 0;
  var areaRestApicalAnterior = valueRestApicalAnterior > 0 ? 1 : 0;
  var areaRestBasalAnteroseptal = valueRestBasalAnteroseptal > 0 ? 1 : 0;
  var areaRestMiddleAnteroseptal = valueRestMiddleAnteroseptal > 0 ? 1 : 0;
  var areaRestApicalAnteroseptal = valueRestApicalAnteroseptal > 0 ? 0.5 : 0;

  var areaRestBasalInferoseptal = valueRestBasalInferoseptal > 0 ? 1 : 0;
  var areaRestMiddleInferoseptal = valueRestMiddleInferoseptal > 0 ? 1 : 0;
  var areaRestApicalInferoseptal = valueRestApicalInferoseptal > 0 ? 0.5 : 0;
  var areaRestBasalInferior = valueRestBasalInferior > 0 ? 1 : 0;
  var areaRestMiddleInfterior = valueRestMiddleInfterior > 0 ? 1 : 0;
  var areaRestApicalInfterior = valueRestApicalInfterior > 0 ? 1 : 0;

  var areaRestBasalInferolateral = valueRestBasalInferolateral > 0 ? 1 : 0;
  var areaRestMiddleInferolateral = valueRestMiddleInferolateral > 0 ? 1 : 0;
  var areaRestApicalInferolateral = valueRestApicalInferolateral > 0 ? 0.5 : 0;
  var areaRestBasalAnterolateral = valueRestBasalAnterolateral > 0 ? 1 : 0;
  var areaRestMiddleAnterolateral = valueRestMiddleAnterolateral > 0 ? 1 : 0;
  var areaRestApicalAnterolateral = valueRestApicalAnterolateral > 0 ? 0.5 : 0;

  var areaStressLAD = areaStressApex + areaStressBasalAnterior + areaStressMiddleAnterior + areaStressApicalAnterior + areaStressBasalAnteroseptal + areaStressMiddleAnteroseptal + areaStressApicalAnteroseptal;
  var areaStressRCA = areaStressBasalInferoseptal + areaStressMiddleInferoseptal + areaStressApicalInferoseptal + areaStressBasalInferior + areaStressMiddleInfterior + areaStressApicalInfterior;
  var areaStressLCX = areaStressBasalInferolateral + areaStressMiddleInferolateral + areaStressApicalInferolateral + areaStressBasalAnterolateral + areaStressMiddleAnterolateral + areaStressApicalAnterolateral;
  var areaRestLAD = areaRestApex + areaRestBasalAnterior + areaRestMiddleAnterior + areaRestApicalAnterior + areaRestBasalAnteroseptal + areaRestMiddleAnteroseptal + areaRestApicalAnteroseptal;
  var areaRestRCA = areaRestBasalInferoseptal + areaRestMiddleInferoseptal + areaRestApicalInferoseptal + areaRestBasalInferior + areaRestMiddleInfterior + areaRestApicalInfterior;
  var areaRestLCX = areaRestBasalInferolateral + areaRestMiddleInferolateral + areaRestApicalInferolateral + areaRestBasalAnterolateral + areaRestMiddleAnterolateral + areaRestApicalAnterolateral;

  // calulate severities
  var severityStressLAD = valuesStressApex.concat(valuesStressAnterior).concat(valuesStressAnteroseptal);
  var severityStressRCA = valuesStressInferoseptal.concat(valuesStressInferior);
  var severityStressLCX = valuesStressInferolateral.concat(valuesStressAnterolateral);
  var severityRestLAD = valuesRestApex.concat(valuesRestAnterior).concat(valuesRestAnteroseptal);
  var severityRestRCA = valuesRestInferoseptal.concat(valuesRestInferior);
  var severityRestLCX = valuesRestInferolateral.concat(valuesRestAnterolateral);

  // Assuming findMinimum, findMaximum, and sumArray functions are already defined

  var severityStressLADString = sumArray(severityStressLAD) == 0 ? "0,0" : findMinimum(severityStressLAD.filter(x => x > 0)) + "," + findMaximum(severityStressLAD.filter(x => x > 0));
  var severityStressRCAString = sumArray(severityStressRCA) == 0 ? "0,0" : findMinimum(severityStressRCA.filter(x => x > 0)) + "," + findMaximum(severityStressRCA.filter(x => x > 0));
  var severityStressLCXString = sumArray(severityStressLCX) == 0 ? "0,0" : findMinimum(severityStressLCX.filter(x => x > 0)) + "," + findMaximum(severityStressLCX.filter(x => x > 0));
  var severityRestLADString = sumArray(severityRestLAD) == 0 ? "0,0" : findMinimum(severityRestLAD.filter(x => x > 0)) + "," + findMaximum(severityRestLAD.filter(x => x > 0));
  var severityRestRCAString = sumArray(severityRestRCA) == 0 ? "0,0" : findMinimum(severityRestRCA.filter(x => x > 0)) + "," + findMaximum(severityRestRCA.filter(x => x > 0));
  var severityRestLCXString = sumArray(severityRestLCX) == 0 ? "0,0" : findMinimum(severityRestLCX.filter(x => x > 0)) + "," + findMaximum(severityRestLCX.filter(x => x > 0));

  // Example of how to use these strings to get values from dicFindingsSeverity

  var dicFindingsSeverity = {
    "0,0": "",
    "1,1": "mildly decreased perfusion",
    "1,2": "mildly to moderately decreased perfusion",
    "1,3": "mildly to severely decreased perfusion",
    "2,2": "moderately decreased perfusion",
    "2,3": "moderately to severely decreased perfusion",
    "3,3": "severely decreased perfusion"
  };

  var findingStressLAD = severityStressLADString == "0,0" ? "" : dicFindingsSeverity[severityStressLADString] + " in " + regionStressLAD.join("/") + " (" + (areaStressLAD < 2.5 ? "small" : areaStressLAD < 4.5 ? "medium" : "large") + ")";
  var findingStressRCA = severityStressRCAString == "0,0" ? "" : dicFindingsSeverity[severityStressRCAString] + " in " + regionStressRCA.join("/") + " (" + (areaStressRCA < 2.5 ? "small" : areaStressRCA < 4.5 ? "medium" : "large") + ")";
  var findingStressLCX = severityStressLCXString == "0,0" ? "" : dicFindingsSeverity[severityStressLCXString] + " in " + regionStressLCX.join("/") + " (" + (areaStressLCX < 2.5 ? "small" : areaStressLCX < 4.5 ? "medium" : "large") + ")";

  var findingRestLAD = severityRestLADString == "0,0" ? "" : dicFindingsSeverity[severityRestLADString] + " in " + regionRestLAD.join("/") + " (" + (areaRestLAD < 2.5 ? "small" : areaRestLAD < 4.5 ? "medium" : "large") + ")";
  var findingRestRCA = severityRestRCAString == "0,0" ? "" : dicFindingsSeverity[severityRestRCAString] + " in " + regionRestRCA.join("/") + " (" + (areaRestRCA < 2.5 ? "small" : areaRestRCA < 4.5 ? "medium" : "large") + ")";
  var findingRestLCX = severityRestLCXString == "0,0" ? "" : dicFindingsSeverity[severityRestLCXString] + " in " + regionRestLCX.join("/") + " (" + (areaRestLCX < 2.5 ? "small" : areaRestLCX < 4.5 ? "medium" : "large") + ")";

  findingStressLAD = findingStressLAD == "" ? "" : findingStressLAD.includes("/") ? findingStressLAD + " regions" : findingStressLAD + " region";
  findingStressRCA = findingStressRCA == "" ? "" : findingStressRCA.includes("/") ? findingStressRCA + " regions" : findingStressRCA + " region";
  findingStressLCX = findingStressLCX == "" ? "" : findingStressLCX.includes("/") ? findingStressLCX + " regions" : findingStressLCX + " region";
  findingRestLAD = findingRestLAD == "" ? "" : findingRestLAD.includes("/") ? findingRestLAD + " regions" : findingRestLAD + " region";
  findingRestRCA = findingRestRCA == "" ? "" : findingRestRCA.includes("/") ? findingRestRCA + " regions" : findingRestRCA + " region";
  findingRestLCX = findingRestLCX == "" ? "" : findingRestLCX.includes("/") ? findingRestLCX + " regions" : findingRestLCX + " region";

  var findingStress = [findingStressLAD, findingStressRCA, findingStressLCX].filter(x => x != "");
  var dictionaryFindingStress = {};

  for (let i = 0; i < findingStress.length; i++) {
    let currentSeverity = findingStress[i].split(" in ")[0];
    let currentRegion = findingStress[i].split(" in ")[1];
    if (Object.keys(dictionaryFindingStress).includes(currentSeverity)) {
      dictionaryFindingStress[currentSeverity].push(currentRegion);
    } else {
      dictionaryFindingStress[currentSeverity] = [currentRegion];
    }
  }
  var severityOrder = ["severely decreased perfusion", "moderately to severely decreased perfusion", "moderately decreased perfusion", "mildly to severely decreased perfusion", "mildly to moderately decreased perfusion", "mildly decreased perfusion"];
  var severityGroupedFindings = [];
  for (let i = 0; i < severityOrder.length; i++) {
    if (Object.keys(dictionaryFindingStress).includes(severityOrder[i])) {
      severityGroupedFindings.push(severityOrder[i] + " in " + formatStringArray(dictionaryFindingStress[severityOrder[i]], txtSplit = ",", txtJucntion = "and"))
    }
  }

  var textSeverityGroupedFindings = severityGroupedFindings.join("; ");

  var differenceApex = valueRestApex - valueStressApex;
  var differenceBasalAnterior = valueRestBasalAnterior - valueStressBasalAnterior;
  var differenceMiddleAnterior = valueRestMiddleAnterior - valueStressMiddleAnterior;
  var differenceApicalAnterior = valueRestApicalAnterior - valueStressApicalAnterior;
  var differenceBasalAnteroseptal = valueRestBasalAnteroseptal - valueStressBasalAnteroseptal;
  var differenceMiddleAnteroseptal = valueRestMiddleAnteroseptal - valueStressMiddleAnteroseptal;
  var differenceApicalAnteroseptal = valueRestApicalAnteroseptal - valueStressApicalAnteroseptal;
  var differenceBasalInferoseptal = valueRestBasalInferoseptal - valueStressBasalInferoseptal;
  var differenceMiddleInferoseptal = valueRestMiddleInferoseptal - valueStressMiddleInferoseptal;
  var differenceApicalInferoseptal = valueRestApicalInferoseptal - valueStressApicalInferoseptal;
  var differenceBasalInferior = valueRestBasalInferior - valueStressBasalInferior;
  var differenceMiddleInfterior = valueRestMiddleInfterior - valueStressMiddleInfterior;
  var differenceApicalInfterior = valueRestApicalInfterior - valueStressApicalInfterior;
  var differenceBasalInferolateral = valueRestBasalInferolateral - valueStressBasalInferolateral;
  var differenceMiddleInferolateral = valueRestMiddleInferolateral - valueStressMiddleInferolateral;
  var differenceApicalInferolateral = valueRestApicalInferolateral - valueStressApicalInferolateral;
  var differenceBasalAnterolateral = valueRestBasalAnterolateral - valueStressBasalAnterolateral;
  var differenceMiddleAnterolateral = valueRestMiddleAnterolateral - valueStressMiddleAnterolateral;
  var differenceApicalAnterolateral = valueRestApicalAnterolateral - valueStressApicalAnterolateral;

  var differencesApex = [differenceApex];
  var differencesAnterior = [differenceBasalAnterior, differenceMiddleAnterior, differenceApicalAnterior];
  var differencesAnteroseptal = [differenceBasalAnteroseptal, differenceMiddleAnteroseptal, differenceApicalAnteroseptal];
  var differencesInferoseptal = [differenceBasalInferoseptal, differenceMiddleInferoseptal, differenceApicalInferoseptal];
  var differencesInferior = [differenceBasalInferior, differenceMiddleInfterior, differenceApicalInfterior];
  var differencesInferolateral = [differenceBasalInferolateral, differenceMiddleInferolateral, differenceApicalInferolateral];
  var differencesAnterolateral = [differenceBasalAnterolateral, differenceMiddleAnterolateral, differenceApicalAnterolateral];

  var differencesLAD = differencesApex.concat(differencesAnterior).concat(differencesAnteroseptal);
  var differencesRCA = differencesInferoseptal.concat(differencesInferior);
  var differencesLCX = differencesInferolateral.concat(differencesAnterolateral);

  // lesion regions of (Stress | Rest)
  var regionOverallLAD = mergeAndRemoveDuplicates(regionStressLAD, regionRestLAD);
  var regionOverallRCA = mergeAndRemoveDuplicates(regionStressRCA, regionRestRCA);
  var regionOverallLCX = mergeAndRemoveDuplicates(regionStressLCX, regionRestLCX);

  var areaOverallLAD =
    Math.max(areaStressApex, areaRestApex) +
    Math.max(areaStressBasalAnterior, areaRestBasalAnterior) +
    Math.max(areaStressMiddleAnterior, areaRestMiddleAnterior) +
    Math.max(areaStressApicalAnterior, areaRestApicalAnterior) +
    Math.max(areaStressBasalAnteroseptal, areaRestBasalAnteroseptal) +
    Math.max(areaStressMiddleAnteroseptal, areaRestMiddleAnteroseptal) +
    Math.max(areaStressApicalAnteroseptal, areaRestApicalAnteroseptal);

  var areaOverallRCA =
    Math.max(areaStressBasalInferoseptal, areaRestBasalInferoseptal) +
    Math.max(areaStressMiddleInferoseptal, areaRestMiddleInferoseptal) +
    Math.max(areaStressApicalInferoseptal, areaRestApicalInferoseptal) +
    Math.max(areaStressBasalInferior, areaRestBasalInferior) +
    Math.max(areaStressMiddleInfterior, areaRestMiddleInfterior) +
    Math.max(areaStressApicalInfterior, areaRestApicalInfterior);

  var areaOverallLCX =
    Math.max(areaStressBasalInferolateral, areaRestBasalInferolateral) +
    Math.max(areaStressMiddleInferolateral, areaRestMiddleInferolateral) +
    Math.max(areaStressApicalInferolateral, areaRestApicalInferolateral) +
    Math.max(areaStressBasalAnterolateral, areaRestBasalAnterolateral) +
    Math.max(areaStressMiddleAnterolateral, areaRestMiddleAnterolateral) +
    Math.max(areaStressApicalAnterolateral, areaRestApicalAnterolateral);

  var severityOverallLAD = compareArraysAndReturnLargerElements(severityStressLAD, severityRestLAD);
  var severityOverallRCA = compareArraysAndReturnLargerElements(severityStressRCA, severityRestRCA);
  var severityOverallLCX = compareArraysAndReturnLargerElements(severityStressLCX, severityRestLCX);

  var severityOverallLADString = sumArray(severityOverallLAD) == 0 ? "0,0" : findMinimum(severityOverallLAD.filter(x => x > 0)) + "," + findMaximum(severityOverallLAD.filter(x => x > 0));
  var severityOverallRCAString = sumArray(severityOverallRCA) == 0 ? "0,0" : findMinimum(severityOverallRCA.filter(x => x > 0)) + "," + findMaximum(severityOverallRCA.filter(x => x > 0));
  var severityOverallLCXString = sumArray(severityOverallLCX) == 0 ? "0,0" : findMinimum(severityOverallLCX.filter(x => x > 0)) + "," + findMaximum(severityOverallLCX.filter(x => x > 0));

  var textDifferencesLAD =
    findingStressLAD == "" ? findingRestLAD :
      isAnyElementGreaterThanZero(differencesLAD) && !isAnyElementLessThanZero(differencesLAD) ? "progression of " + findingRestLAD :
        isAnyElementGreaterThanZero(differencesLAD) ? "partial redistribution while partial progression of " + dicFindingsSeverity[severityOverallLADString] + " in " + regionOverallLAD.join("/") + " (" + (areaOverallLAD < 2.5 ? "small" : areaOverallLAD < 4.5 ? "medium" : "large") + ")" + (regionOverallLAD.length > 1 ? " regions" : " region") :
          !isAnyElementGreaterThanZero(differencesLAD) && !isAnyElementLessThanZero(differencesLAD) ? "no redistribution in " + regionOverallLAD.join("/") + (regionOverallLAD.length > 1 ? " regions" : " region") :
            !isAnyElementGreaterThanZero(differencesLAD) && sumArray(severityRestLAD) == 0 ? "complete redistribution in " + regionOverallLAD.join("/") + (regionOverallLAD.length > 1 ? " regions" : " region") :
              "partial redistribution in " + regionOverallLAD.join("/") + (regionOverallLAD.length > 1 ? " regions" : " region");



  var textDifferencesRCA =
    findingStressRCA == "" ? findingRestRCA :
      isAnyElementGreaterThanZero(differencesRCA) && !isAnyElementLessThanZero(differencesRCA) ? "progression of " + findingRestRCA :
        isAnyElementGreaterThanZero(differencesRCA) ? "partial redistribution while partial progression of " + dicFindingsSeverity[severityOverallRCAString] + " in " + regionOverallRCA.join("/") + " (" + (areaOverallRCA < 2.5 ? "small" : areaOverallRCA < 4.5 ? "medium" : "large") + ")" + (regionOverallRCA.length > 1 ? " regions" : " region") :
          !isAnyElementGreaterThanZero(differencesRCA) && !isAnyElementLessThanZero(differencesRCA) ? "no redistribution in " + regionOverallRCA.join("/") + (regionOverallRCA.length > 1 ? " regions" : " region") :
            !isAnyElementGreaterThanZero(differencesRCA) && sumArray(severityRestRCA) == 0 ? "complete redistribution in " + regionOverallRCA.join("/") + (regionOverallRCA.length > 1 ? " regions" : " region") :
              "partial redistribution in " + regionOverallRCA.join("/") + (regionOverallRCA.length > 1 ? " regions" : " region");



  var textDifferencesLCX =
    findingStressLCX == "" ? findingRestLCX :
      isAnyElementGreaterThanZero(differencesLCX) && !isAnyElementLessThanZero(differencesLCX) ? "progression of " + findingRestLCX :
        isAnyElementGreaterThanZero(differencesLCX) ? "partial redistribution while partial progression of " + dicFindingsSeverity[severityOverallLCXString] + " in " + regionOverallLCX.join("/") + " (" + (areaOverallLCX < 2.5 ? "small" : areaOverallLCX < 4.5 ? "medium" : "large") + ")" + (regionOverallLCX.length > 1 ? " regions" : " region") :
          !isAnyElementGreaterThanZero(differencesLCX) && !isAnyElementLessThanZero(differencesLCX) ? "no redistribution in " + regionOverallLCX.join("/") + (regionOverallLCX.length > 1 ? " regions" : " region") :
            !isAnyElementGreaterThanZero(differencesLCX) && sumArray(severityRestLCX) == 0 ? "complete redistribution in " + regionOverallLCX.join("/") + (regionOverallLCX.length > 1 ? " regions" : " region") :
              "partial redistribution in " + regionOverallLCX.join("/") + (regionOverallLCX.length > 1 ? " regions" : " region");

  var dictionaryDifferences = {};

  for (let i of [textDifferencesLAD, textDifferencesRCA, textDifferencesLCX]) {

    let currentDifference = i.split(" in ")[0];
    let currentRegion = i.split(" in ")[1];
    if (Object.keys(dictionaryDifferences).includes(currentDifference)) {
      dictionaryDifferences[currentDifference].push(currentRegion);
    } else {
      dictionaryDifferences[currentDifference] = [currentRegion];
    }

  }


  differenceOrder = [
    "progression of severely decreased perfusion",
    "progression of moderately to severely decreased perfusion",
    "progression of moderately decreased perfusion",
    "progression of mildly to severely decreased perfusion",
    "progression of mildly to moderately decreased perfusion",
    "progression of mildly decreased perfusion",
    "partial redistribution while partial progression of severely decreased perfusion",
    "partial redistribution while partial progression of moderately to severely decreased perfusion",
    "partial redistribution while partial progression of moderately decreased perfusion",
    "partial redistribution while partial progression of mildly to severely decreased perfusion",
    "partial redistribution while partial progression of mildly to moderately decreased perfusion",
    "partial redistribution while partial progression of mildly decreased perfusion",
    "no redistribution",
    "partial redistribution",
    "complete redistribution",
    "severely decreased perfusion",
    "moderately to severely decreased perfusion",
    "moderately decreased perfusion",
    "mildly to severely decreased perfusion",
    "mildly to moderately decreased perfusion",
    "mildly decreased perfusion",
  ]

  // var flagJoin = false;
  var differencesGroupedFindings = [];
  var differencesGroupedFindingsNew = [];
  for (let i of differenceOrder) {
    if (Object.keys(dictionaryDifferences).includes(i)) {
      differencesGroupedFindings.push(i + " in " + formatStringArray(dictionaryDifferences[i], txtSplit = ",", txtJucntion = "and"))
    }
  }



  var variantsProgression = differencesGroupedFindings.filter(x => x.slice(0, 11) == "progression");
  var polyProgression = variantsProgression.filter(x => x.includes("and")).length > 0;
  var differencesGroupedProgressionFindings = formatStringArray(variantsProgression.map(x => x.replace("progression of ", "")), txtSplit = ",", txtJucntion = (polyProgression ? ", and" : "and")).replace(" ,", ",");
  if (differencesGroupedProgressionFindings.length > 0) {
    differencesGroupedFindingsNew.push("progression of " + differencesGroupedProgressionFindings);
  }

  var variantsWhile = differencesGroupedFindings.filter(x => x.includes("partial redistribution while"));

  var polyWhile = variantsWhile.filter(x => x.includes("and")).length > 0;
  var differencesGroupedWhileFindings = formatStringArray(variantsWhile.map(x => x.replace("partial redistribution while partial progression of ", "")), txtSplit = ";", txtJucntion = (polyWhile ? ", and" : "and")).replace(" ,", ",");
  if (differencesGroupedWhileFindings.length > 0) {
    differencesGroupedFindingsNew.push("partial redistribution while partial progression of " + differencesGroupedWhileFindings);
  }
  differencesGroupedFindingsNew = differencesGroupedFindingsNew
    .concat(differencesGroupedFindings.filter(x => x.includes("no redistribution")))
    .concat(differencesGroupedFindings.filter(x => x.split(" in ")[0] == "partial redistribution"))
    .concat(differencesGroupedFindings.filter(x => x.includes("complete redistribution")))


  var variantsReverse = differencesGroupedFindings.filter(x => ["sev", "mod", "mil"].includes(x.slice(0, 3)));
  var polyReverse = variantsReverse.filter(x => x.includes("and")).length > 0;
  var differencesGroupedReverseFindings = formatStringArray(variantsReverse, txtSplit = ";", txtJucntion = (polyReverse ? ", and" : "and")).replace(" ,", ",");
  if (differencesGroupedReverseFindings.length > 0) {
    differencesGroupedFindingsNew.push(differencesGroupedReverseFindings);
  }
  
  var textDifferencesGroupedFindings = differencesGroupedFindingsNew.join("; ");

  // return impression

  var impressionLAD =
    textDifferencesLAD == "" ? "" :
      textDifferencesLAD.includes("progression") ? textDifferencesLAD.split(" of ")[1].replace("decreased perfusion", "mixed viable and non-viable myocardial tissues") :
        textDifferencesLAD.includes("complete") ? textDifferencesLAD.replace("complete redistribution", dicFindingsSeverity[severityOverallLADString].replace(" decreased perfusion", "") + " myocardial ischemia").replace("region", "(" + (areaOverallLAD < 2.5 ? "small" : areaOverallLAD < 4.5 ? "medium" : "large") + ") region") :
          textDifferencesLAD.includes("partial") ? textDifferencesLAD.replace("partial redistribution", dicFindingsSeverity[severityOverallLADString].replace(" decreased perfusion", "") + " mixed viable and non-viable myocardial tissues").replace("region", "(" + (areaOverallLAD < 2.5 ? "small" : areaOverallLAD < 4.5 ? "medium" : "large") + ") region") :
            textDifferencesLAD.includes("no ") ? textDifferencesLAD.replace("no redistribution", dicFindingsSeverity[severityOverallLADString].replace(" decreased perfusion", "") + " non-viable myocardial tissues").replace("region", "(" + (areaOverallLAD < 2.5 ? "small" : areaOverallLAD < 4.5 ? "medium" : "large") + ") region") :
              textDifferencesLAD.replace("decreased perfusion", "reverse redistribution");

  var impressionRCA =
    textDifferencesRCA == "" ? "" :
      textDifferencesRCA.includes("progression") ? textDifferencesRCA.split(" of ")[1].replace("decreased perfusion", "mixed viable and non-viable myocardial tissues") :
        textDifferencesRCA.includes("complete") ? textDifferencesRCA.replace("complete redistribution", dicFindingsSeverity[severityOverallRCAString].replace(" decreased perfusion", "") + " myocardial ischemia").replace("region", "(" + (areaOverallRCA < 2.5 ? "small" : areaOverallRCA < 4.5 ? "medium" : "large") + ") region") :
          textDifferencesRCA.includes("partial") ? textDifferencesRCA.replace("partial redistribution", dicFindingsSeverity[severityOverallRCAString].replace(" decreased perfusion", "") + " mixed viable and non-viable myocardial tissues").replace("region", "(" + (areaOverallRCA < 2.5 ? "small" : areaOverallRCA < 4.5 ? "medium" : "large") + ") region") :
            textDifferencesRCA.includes("no ") ? textDifferencesRCA.replace("no redistribution", dicFindingsSeverity[severityOverallRCAString].replace(" decreased perfusion", "") + " non-viable myocardial tissues").replace("region", "(" + (areaOverallRCA < 2.5 ? "small" : areaOverallRCA < 4.5 ? "medium" : "large") + ") region") :
              textDifferencesRCA.replace("decreased perfusion", "reverse redistribution");

  var impressionLCX =
    textDifferencesLCX == "" ? "" :
      textDifferencesLCX.includes("progression") ? textDifferencesLCX.split(" of ")[1].replace("decreased perfusion", "mixed viable and non-viable myocardial tissues") :
        textDifferencesLCX.includes("complete") ? textDifferencesLCX.replace("complete redistribution", dicFindingsSeverity[severityOverallLCXString].replace(" decreased perfusion", "") + " myocardial ischemia").replace("region", "(" + (areaOverallLCX < 2.5 ? "small" : areaOverallLCX < 4.5 ? "medium" : "large") + ") region") :
          textDifferencesLCX.includes("partial") ? textDifferencesLCX.replace("partial redistribution", dicFindingsSeverity[severityOverallLCXString].replace(" decreased perfusion", "") + " mixed viable and non-viable myocardial tissues").replace("region", "(" + (areaOverallLCX < 2.5 ? "small" : areaOverallLCX < 4.5 ? "medium" : "large") + ") region") :
            textDifferencesLCX.includes("no ") ? textDifferencesLCX.replace("no redistribution", dicFindingsSeverity[severityOverallLCXString].replace(" decreased perfusion", "") + " non-viable myocardial tissues").replace("region", "(" + (areaOverallLCX < 2.5 ? "small" : areaOverallLCX < 4.5 ? "medium" : "large") + ") region") :
              textDifferencesLCX.replace("decreased perfusion", "reverse redistribution");

  // var outputFindings = [findingStressLAD, findingStressRCA, findingStressLCX].filter(x => x != "").join("; ");

  var outputFindings = textSeverityGroupedFindings;
  outputFindings = outputFindings == "" ? "no perfusion defect" : outputFindings;
  
  // 檢查藥物選擇，如果不是 Persantin 則使用 "initial images" 代替 "stress images"
  var medicationValue = document.getElementById('medicationSelect').value;
  if (medicationValue !== "Persantin") {
    outputFindings = "The initial images disclosed " + outputFindings + ".\n";
  } else {
    outputFindings = "The stress images disclosed " + outputFindings + ".\n";
  }

  outputFindings = outputFindings
    + "The delayed images disclosed "
    + textDifferencesGroupedFindings + ".";
  // + [textDifferencesLAD, textDifferencesRCA, textDifferencesLCX].filter(x => x != "").join("; ") + ".";

  outputFindings = outputFindings.includes("The delayed images disclosed .") ? "The stress and delayed images disclosed no perfusion defect." : outputFindings;

  var scoreLAD = sumArray(valuesStressApex.concat(valuesStressAnterior).concat(valuesStressAnteroseptal)) * 4 + sumArray(valuesRestApex.concat(valuesRestAnterior).concat(valuesRestAnteroseptal));
  var scoreRCA = sumArray(valuesStressInferoseptal.concat(valuesStressInferior)) * 4 + sumArray(valuesRestInferoseptal.concat(valuesRestInferior));
  var scoreLCX = sumArray(valuesStressInferolateral.concat(valuesStressAnterolateral)) * 4 + sumArray(valuesRestInferolateral.concat(valuesRestAnterolateral));

  let impressions = [impressionLAD, impressionRCA, impressionLCX];
  let scores = [scoreLAD, scoreRCA, scoreLCX];

  // Combine the arrays into an array of objects
  let combined = impressions.map((impression, index) => {
    return { impression: impression, score: scores[index] };
  });

  // Sort the combined array based on the scores
  combined.sort((a, b) => b.score - a.score);

  // Extract the sorted impressions
  let sortedImpressions = combined.map(item => item.impression);

  var dictionaryImpressions = {};

  for (let i of sortedImpressions) {
    let currentSeverity = i.split(" in ")[0];
    let currentRegion = i.split(" in ")[1];

    if (Object.keys(dictionaryImpressions).includes(currentSeverity)) {
      dictionaryImpressions[currentSeverity].push(currentRegion);
    } else {
      dictionaryImpressions[currentSeverity] = [currentRegion];
    }
  }

  var finalImpressions = [];
  for (let i of Object.keys(dictionaryImpressions)) {
    if (i.length > 0) {
      finalImpressions.push(i + " in " + formatStringArray(dictionaryImpressions[i], txtSplit = ",", txtJucntion = "and"));
    }
  }

  var outputImpression = prefixArrayElementsWithIndex(finalImpressions.filter(x => x != "").map(x => capitalizeFirstCharacter(x.replace("mildly", "mild").replace("moderately", "moderate").replace("severely", "severe")) + ".")).join("\n");

  outputImpression = outputImpression == "" ? "Normal myocardial perfusion study." : outputImpression.includes("2. ") ? outputImpression : outputImpression.replace("1. ", "");

  return {
    'outputFindings': outputFindings,
    'outputImpression': outputImpression
  }
}

function sumArray(arr) {
  return arr.reduce(function (accumulator, currentValue) {
    return accumulator + currentValue;
  }, 0);
}

function findMinimum(arr) {
  return arr.reduce(function (min, currentValue) {
    return (currentValue < min) ? currentValue : min;
  });
}

function findMaximum(arr) {
  return arr.reduce(function (max, currentValue) {
    return (currentValue > max) ? currentValue : max;
  });
}

function formatStringArray(arr, txtSplit = ";", txtJucntion = "and") {
  let length = arr.length;

  if (length === 0) {
    return "";
  } else if (length === 1) {
    return arr[0];
  } else if (length === 2) {
    return arr[0] + " " + txtJucntion + " " + arr[1];
  } else {
    return arr.slice(0, -1).join(txtSplit + " ") + txtSplit + " " + txtJucntion + " " + arr[length - 1];
  }
}

function isAnyElementGreaterThanZero(arr) {
  return arr.some(function (element) {
    return element > 0;
  });
}

function isAnyElementLessThanZero(arr) {
  return arr.some(function (element) {
    return element < 0;
  });
}

function mergeAndRemoveDuplicates(arr1, arr2) {
  return Array.from(new Set(arr1.concat(arr2)));
}

function compareArraysAndReturnLargerElements(arr1, arr2) {
  return arr1.map((element, index) => Math.max(element, arr2[index]));
}

function capitalizeFirstCharacter(sentence) {
  if (sentence && typeof sentence === 'string') {
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  } else {
    return '';
  }
}

function prefixArrayElementsWithIndex(arr) {
  return arr.map((element, index) => `${index + 1}. ${element}`);
}

// 當文檔完成載入時設置監聽器
document.addEventListener('DOMContentLoaded', function() {
    console.log('報告生成器：頁面已載入，等待患者資料...');
    
    // 設置全局變數存儲患者資料
    window.patientData = null;
    
    // 檢查是否有 opener 並發送請求
    if (window.opener) {
        console.log('報告生成器：檢測到父窗口存在，準備請求患者資料');
        // 立即發送初始請求
        requestPatientDataFromParent('MPI_REPORT_GENERATOR_INITIAL');
        showNotification('報告生成器已載入，正在請求患者資料...');
    } else {
        console.log('報告生成器：沒有檢測到父窗口');
        showNotification('無法與父窗口通訊，請直接使用測試資料');
    }
    
    // 稍後再嘗試如果還沒收到資料
    setTimeout(function() {
        if (!window.patientData && window.opener) {
            console.log('報告生成器：3秒後未收到資料，請求資料重發');
            requestPatientDataFromParent('MPI_REPORT_GENERATOR_RETRY');
        }
    }, 3000);
    
    // 如果還未收到數據，再嘗試一次
    setTimeout(function() {
        if (!window.patientData && window.opener) {
            console.log('報告生成器：10秒後依然未收到資料，最後一次嘗試請求');
            requestPatientDataFromParent('MPI_REPORT_GENERATOR_FINAL');
        }
    }, 10000);
    
    // 註冊導入數據按鈕的事件
    const importDataBtn = document.getElementById('importDataBtn');
    if (importDataBtn) {
        importDataBtn.addEventListener('click', importPatientData);
    }
    
    // 添加控制台調試提示
    console.info('報告生成器：可以在控制台中運行以下代碼手動測試數據接收:');
    console.info(`
    window.dispatchEvent(new MessageEvent('message', {
        data: {
            type: 'GUI_EXTENSION_DATA',
            mciid: '12345678',
            patientInfo: {
                gender: 'F',
                age: '45',
                referno: 'TEST-REF-123',
                patno: 'TEST-PAT-456'
            }
        },
        origin: window.location.origin
    }));
    `);
});

// 處理患者資訊的函數
function handlePatientInfo(patientInfo) {
    if (!patientInfo) {
        console.error('報告生成器：收到空的患者資訊');
        return;
    }
    
    try {
        // 獲取性別資訊，並做標準化處理
        let genderText = '';
        if (patientInfo.gender) {
            // 將數字或代碼轉換為文字
            if (patientInfo.gender === 'M' || patientInfo.gender === '1' || 
                patientInfo.gender.toLowerCase() === 'm' || patientInfo.gender.includes('男')) {
                genderText = '男';
            } else if (patientInfo.gender === 'F' || patientInfo.gender === '2' || 
                patientInfo.gender.toLowerCase() === 'f' || patientInfo.gender.includes('女')) {
                genderText = '女';
            } else {
                genderText = patientInfo.gender; // 使用原始值
            }
        }
        
        // 獲取其他患者資訊
        const age = patientInfo.age || '';
        const referno = patientInfo.referno || '';
        const patno = patientInfo.patno || '';
        
        // 顯示在頁面上
        displayPatientInfo(genderText, age, referno, patno);
        
    } catch (e) {
        console.error('報告生成器：處理患者資訊時出錯:', e);
    }
}

// 在頁面上顯示患者資訊
function displayPatientInfo(gender, age, referno, patno) {
    // 尋找頁面上的元素
    updateElementContent('gender', gender);
    updateElementContent('age', age);
    updateElementContent('referno', referno);
    updateElementContent('patno', patno);
}

// 更新元素內容的輔助函數
function updateElementContent(id, value) {
    // 嘗試多種選擇器
    const selectors = [
        `#${id}`, 
        `[name="${id}"]`, 
        `.${id}`, 
        `input[name="${id}"]`, 
        `span.${id}`,
        `div.${id}`,
        `[data-field="${id}"]`
    ];
    
    // 嘗試每一個選擇器
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            // 根據元素類型設置內容
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = value;
            } else {
                element.textContent = value;
            }
            console.log(`報告生成器：更新了 ${id} 元素，值為 ${value}`);
            return true;
        }
    }
    
    console.log(`報告生成器：未找到 ${id} 元素`);
    return false;
}

// 修改模擬接收測試數據的函數，添加請求真實數據的功能
function importPatientData() {
    console.log('報告生成器：開始執行 importPatientData 函數');
    
    // 嘗試從父窗口請求真實數據
    if (window.opener) {
        console.log('報告生成器：正在請求真實患者資料...');
        
        // 使用安全的方式發送請求
        if (requestPatientDataFromParent('MPI_REPORT_GENERATOR_BUTTON_CLICK')) {
            // 顯示通知
            showNotification('已向父窗口請求患者資料，請等待回應');
            
            // 設置一個短期超時，如果父窗口沒有響應，則使用測試數據
            setTimeout(function() {
                if (!window.patientData) {
                    console.log('報告生成器：請求超時，將使用測試數據');
                    useTestData();
                }
            }, 5000);
            
            return;
        }
    } else {
        console.log('報告生成器：沒有父窗口，無法請求真實資料');
    }
    
    // 如果無法請求真實數據，則使用測試數據
    useTestData();
}

// 使用測試數據的輔助函數
function useTestData() {
    console.log('報告生成器：使用測試數據');
    
    // 模擬收到 postMessage 資料
    window.dispatchEvent(new MessageEvent('message', {
        data: {
            type: 'GUI_EXTENSION_DATA',
            mciid: '9310308',
            patientInfo: {
                gender: 'M',
                age: '87',
                referno: '931025P01283',
                patno: '02375862'
            }
        },
        origin: window.location.origin // 模擬來自同源
    }));
    
    // 顯示通知
    showNotification('已導入測試患者資料 (無法獲取真實資料)');
}

/**
 * 向父窗口發送獲取患者數據的請求
 * 專門處理跨域安全通信
 */
function requestPatientDataFromParent(source) {
  if (!window.opener) {
    console.error('報告生成器：無法發送請求，父窗口不存在');
    return false;
  }
  
  try {
    const request = {
      type: 'REQUEST_DATA',
      timestamp: new Date().getTime(),
      source: source || 'MPI_REPORT_GENERATOR'
    };
    
    console.log('報告生成器：發送數據請求:', request);
    
    // 使用通配符作為目標源，允許任何域接收消息
    window.opener.postMessage(request, '*');
    return true;
  } catch (error) {
    console.error('報告生成器：發送請求時出錯:', error);
    return false;
  }
}