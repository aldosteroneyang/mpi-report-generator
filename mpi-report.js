/**
 * MPI 報告生成器 - JavaScript 函數庫
 * 基於圓形區塊圖表生成核醫心肌灌注掃描 (MPI) 報告
 */

// 等待 DOM 完全加載後初始化
document.addEventListener('DOMContentLoaded', initReportGenerator);

/**
 * 從 LocalStorage 獲取數據的函數
 * @returns {boolean} 是否成功獲取並處理數據
 */
function getDataFromURLParams() {
  console.log('----------- 數據加載開始 -----------');
  console.log('完整URL:', window.location.href);
  
  // 獲取URL fragment (# 後面的部分)
  const fragmentString = window.location.hash.substring(1); // 移除開頭的 # 符號
  console.log('URL fragment:', fragmentString);
  
  // 解析fragment參數
  const params = new URLSearchParams(fragmentString);
  const transferId = params.get('transferId');
  
  if (transferId) {
    console.log('找到傳輸ID:', transferId);
    
    // 嘗試從LocalStorage獲取數據
    try {
      const storedData = localStorage.getItem(transferId);
      
      if (storedData) {
        console.log('從LocalStorage獲取數據成功，數據長度:', storedData.length);
        
        // 解析JSON數據
        const data = JSON.parse(storedData);
        console.log('解析後的數據對象結構:', Object.keys(data));
        
        // 處理數據
        handlePatientData(data);
        console.log('----------- 數據處理完成 -----------');
        
        // 可選：處理完數據後從LocalStorage中刪除
        // localStorage.removeItem(transferId);
        
        return true;
      } else {
        console.error('LocalStorage中沒有找到對應數據');
        showNotification('無法獲取患者資料，請重試。');
        console.log('----------- 數據加載失敗 -----------');
        return false;
      }
    } catch (e) {
      console.error('從LocalStorage獲取數據時出錯:', e);
      console.error('錯誤位置:', e.stack);
      showNotification('解析患者資料時出錯: ' + e.message);
      console.log('----------- 數據加載失敗 -----------');
      return false;
    }
  } else {
    // 向後兼容 - 嘗試其他數據傳輸方式
    
    // 1. 檢查舊的 #data= 方式
    if (fragmentString && fragmentString.startsWith('data=')) {
      console.log('檢測到舊版 #data= 格式的數據');
      const encodedData = fragmentString.substring(5); // 移除 'data=' 部分
      
      try {
        // 解碼 Base64 資料
        const jsonString = atob(encodedData);
        const data = JSON.parse(jsonString);
        handlePatientData(data);
        console.log('----------- 數據處理完成 (舊版格式) -----------');
        return true;
      } catch (e) {
        console.error('解析舊版數據格式時出錯:', e);
      }
    }
    
    // 2. 檢查URL搜索參數中的 data 參數
    const urlParams = new URLSearchParams(window.location.search);
    const searchEncodedData = urlParams.get('data');
    
    if (searchEncodedData) {
      console.log('在URL搜索參數中找到數據');
      try {
        // 解碼 Base64 資料
        const jsonString = atob(searchEncodedData);
        const data = JSON.parse(jsonString);
        handlePatientData(data);
        console.log('----------- 數據處理完成 (搜索參數) -----------');
        return true;
      } catch (e) {
        console.error('解析URL搜索參數時出錯:', e);
      }
    }
    
    console.log('未找到任何數據源 (無 transferId, fragment data 或搜索參數)');
    console.log('----------- 數據加載結束 -----------');
    
    // 添加一個測試按鈕，方便開發測試
    addTestButton();
    return false;
  }
}

/**
 * 添加一個測試按鈕，用於測試患者資料顯示功能
 */
function addTestButton() {
  // 避免重複添加
  if (document.getElementById('testDataBtn')) return;
  
  // 建立按鈕容器
  const btnContainer = document.createElement('div');
  btnContainer.style.position = 'fixed';
  btnContainer.style.top = '10px';
  btnContainer.style.right = '200px';
  btnContainer.style.zIndex = '1000';
  btnContainer.style.display = 'flex';
  btnContainer.style.flexDirection = 'column';
  btnContainer.style.gap = '5px';
  
  // 創建直接測試按鈕
  const testBtn = document.createElement('button');
  testBtn.id = 'testDataBtn';
  testBtn.textContent = '測試患者資料';
  testBtn.style.padding = '5px 10px';
  testBtn.style.backgroundColor = '#f0ad4e';
  testBtn.style.color = 'white';
  testBtn.style.border = 'none';
  testBtn.style.borderRadius = '3px';
  testBtn.style.cursor = 'pointer';
  
  // 創建LocalStorage測試按鈕
  const testLSBtn = document.createElement('button');
  testLSBtn.id = 'testLSBtn';
  testLSBtn.textContent = '測試LocalStorage';
  testLSBtn.style.padding = '5px 10px';
  testLSBtn.style.backgroundColor = '#5bc0de';
  testLSBtn.style.color = 'white';
  testLSBtn.style.border = 'none';
  testLSBtn.style.borderRadius = '3px';
  testLSBtn.style.cursor = 'pointer';
  
  // 添加測試資料處理事件
  testBtn.addEventListener('click', function() {
    console.log('測試按鈕點擊 - 載入示例患者資料');
    
    // 使用示例資料
    handlePatientData({
      mciid: "123456",
      patientInfo: {
        gender: "M",
        age: "65",
        referno: "T12345",
        patno: "P23456"
      }
    });
  });
  
  // 添加LocalStorage測試事件
  testLSBtn.addEventListener('click', function() {
    console.log('LocalStorage測試按鈕點擊');
    
    // 生成測試資料
    const testData = {
      mciid: "LS-TEST-" + Math.floor(Math.random() * 1000),
      patientInfo: {
        gender: "F",
        age: "42",
        referno: "LS-" + Math.floor(Math.random() * 10000),
        patno: "PAT-" + Math.floor(Math.random() * 10000)
      }
    };
    
    // 生成唯一ID
    const transferId = 'test-' + Date.now();
    
    try {
      // 存儲數據到LocalStorage
      localStorage.setItem(transferId, JSON.stringify(testData));
      console.log('測試數據已存儲到LocalStorage, ID:', transferId);
      
      // 測試從LocalStorage讀取數據
      const storedData = localStorage.getItem(transferId);
      if (storedData) {
        const data = JSON.parse(storedData);
        handlePatientData(data);
        showNotification('從LocalStorage加載數據成功，ID: ' + transferId);
      } else {
        console.error('無法從LocalStorage讀取剛存儲的數據');
        showNotification('測試失敗：無法讀取存儲的數據');
      }
    } catch (e) {
      console.error('LocalStorage測試出錯:', e);
      showNotification('LocalStorage測試出錯: ' + e.message);
    }
  });
  
  // 添加到按鈕容器
  btnContainer.appendChild(testBtn);
  btnContainer.appendChild(testLSBtn);
  
  // 添加到頁面
  document.body.appendChild(btnContainer);
  console.log('已添加測試按鈕');
}

/**
 * 處理患者資料
 * @param {Object} data - 收到的患者資料對象
 */
function handlePatientData(data) {
  // 設置全局變數存儲患者資料
  window.patientData = data;
  
  // 處理患者資訊
  if (data.patientInfo) {
    console.log('處理患者資訊:', data.patientInfo);
    handlePatientInfo(data.patientInfo);
  }
  
  // 處理MCIID
  if (data.mciid) {
    console.log('處理MCIID:', data.mciid);
    const mciidElement = document.getElementById('mciid');
    if (mciidElement) {
      mciidElement.textContent = `MCIID: ${data.mciid}`;
    }
  }
  
  // 顯示患者資料區塊
  const patientInfoBlock = document.getElementById('patientInfoBlock');
  if (patientInfoBlock) {
    patientInfoBlock.style.display = 'block';
  }
  
  // 顯示通知
  showNotification('已接收患者資料!');
}

/**
 * 處理患者資訊的函數
 * @param {Object} patientInfo - 患者資訊對象
 */
function handlePatientInfo(patientInfo) {
  if (!patientInfo) {
    console.error('收到空的患者資訊');
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
    updateElementContent('gender', `性別: ${genderText}`);
    updateElementContent('age', `年齡: ${age}`);
    updateElementContent('referno', `報告編號: ${referno}`);
    updateElementContent('patno', `病患編號: ${patno}`);
  } catch (e) {
    console.error('處理患者資訊時出錯:', e);
  }
}

/**
 * 更新元素內容的輔助函數
 * @param {string} id - 元素ID
 * @param {string} value - 要設置的值
 * @returns {boolean} - 更新是否成功
 */
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
      console.log(`更新了 ${id} 元素，值為 ${value}`);
      return true;
    }
  }
  
  console.log(`未找到 ${id} 元素`);
  return false;
}

function initReportGenerator() {
  // 首先嘗試從URL參數獲取數據
  getDataFromURLParams();

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

  // 3秒後自動隱藏
  setTimeout(function() {
    notification.style.visibility = 'hidden';
  }, 3000);
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