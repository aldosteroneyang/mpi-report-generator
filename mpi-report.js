/**
 * MPI 報告生成器 - JavaScript 函數庫
 * 基於圓形區塊圖表生成核醫心肌灌注掃描 (MPI) 報告
 */

// 等待 DOM 完全加載後初始化
document.addEventListener('DOMContentLoaded', initReportGenerator);

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
  
  // 映射閾值 (0=正常, 1=輕度, 2=中度, 3=重度)
  const dic = { "0": 0, "1": 1, "2": 2, "3": 3 };
  
  // 使用已經更新的 segmentDefinition
  const segmentDefinition = {
    // 中心點 (apex)
    apex: [18],
    
    // 前壁 (anterior) 分段
    basalAnterior: [4],
    middleAnterior: [10],
    apicalAnterior: [15],
    
    // 前隔壁 (anteroseptal) 分段
    basalAnteroseptal: [3],
    middleAnteroseptal: [9],
    apicalAnteroseptal: [14],
    
    // 下隔壁 (inferoseptal) 分段
    basalInferoseptal: [2],
    middleInferoseptal: [8],
    apicalInferoseptal: [13],
    
    // 下壁 (inferior) 分段
    basalInferior: [1],
    middleInferior: [7],
    apicalInferior: [12],
    
    // 下外側壁 (inferolateral) 分段
    basalInferolateral: [0],
    middleInferolateral: [6],
    apicalInferolateral: [17],
    
    // 前外側壁 (anterolateral) 分段
    basalAnterolateral: [5],
    middleAnterolateral: [11],
    apicalAnterolateral: [16],
  };
  
  // 血管區域分組
  const vesselRegions = {
    LAD: ['apex', 'basalAnterior', 'middleAnterior', 'apicalAnterior', 
          'basalAnteroseptal', 'middleAnteroseptal', 'apicalAnteroseptal'],
    RCA: ['basalInferoseptal', 'middleInferoseptal', 'apicalInferoseptal',
          'basalInferior', 'middleInferior', 'apicalInferior'],
    LCX: ['basalInferolateral', 'middleInferolateral', 'apicalInferolateral',
          'basalAnterolateral', 'middleAnterolateral', 'apicalAnterolateral']
  };
  
  // 區域對應的簡短名稱（用於報告描述）
  const regionDisplayNames = {
    LAD: ["anterior", "anteroseptal", "apex"],
    RCA: ["inferoseptal", "inferior"],
    LCX: ["inferolateral", "anterolateral"]
  };
  
  // 提取每個區域的值
  const extractValues = function(values, segmentDef) {
    const result = {};
    Object.keys(segmentDef).forEach(region => {
      const indices = segmentDef[region];
      result[region] = indices.map(idx => values[idx] || 0);
    });
    return result;
  };
  
  // 提取每個區域的應力和休息值
  const regionStressValues = extractValues(stressValues, segmentDefinition);
  const regionRestValues = extractValues(restValues, segmentDefinition);
  
  // 計算各血管區域的應力缺損值
  const vesselStressValues = {};
  const vesselRestValues = {};
  Object.keys(vesselRegions).forEach(vessel => {
    vesselStressValues[vessel] = [];
    vesselRestValues[vessel] = [];
    vesselRegions[vessel].forEach(region => {
      vesselStressValues[vessel] = vesselStressValues[vessel].concat(regionStressValues[region]);
      vesselRestValues[vessel] = vesselRestValues[vessel].concat(regionRestValues[region]);
    });
  });
  
  // 計算各區域的面積
  function calculateAreas() {
    // 計算應力檢查的各區域面積
    const stressAreas = {
      apex: regionStressValues.apex[0] > 0 ? 1 : 0,
      
      basalAnterior: regionStressValues.basalAnterior[0] > 0 ? 1 : 0,
      middleAnterior: regionStressValues.middleAnterior[0] > 0 ? 1 : 0,
      apicalAnterior: regionStressValues.apicalAnterior[0] > 0 ? 1 : 0,
      
      basalAnteroseptal: regionStressValues.basalAnteroseptal[0] > 0 ? 1 : 0,
      middleAnteroseptal: regionStressValues.middleAnteroseptal[0] > 0 ? 1 : 0,
      apicalAnteroseptal: regionStressValues.apicalAnteroseptal[0] > 0 ? 0.5 : 0,
      
      basalInferoseptal: regionStressValues.basalInferoseptal[0] > 0 ? 1 : 0,
      middleInferoseptal: regionStressValues.middleInferoseptal[0] > 0 ? 1 : 0,
      apicalInferoseptal: regionStressValues.apicalInferoseptal[0] > 0 ? 0.5 : 0,
      
      basalInferior: regionStressValues.basalInferior[0] > 0 ? 1 : 0,
      middleInferior: regionStressValues.middleInferior[0] > 0 ? 1 : 0,
      apicalInferior: regionStressValues.apicalInferior[0] > 0 ? 1 : 0,
      
      basalInferolateral: regionStressValues.basalInferolateral[0] > 0 ? 1 : 0,
      middleInferolateral: regionStressValues.middleInferolateral[0] > 0 ? 1 : 0,
      apicalInferolateral: regionStressValues.apicalInferolateral[0] > 0 ? 0.5 : 0,
      
      basalAnterolateral: regionStressValues.basalAnterolateral[0] > 0 ? 1 : 0,
      middleAnterolateral: regionStressValues.middleAnterolateral[0] > 0 ? 1 : 0,
      apicalAnterolateral: regionStressValues.apicalAnterolateral[0] > 0 ? 0.5 : 0
    };
    
    // 計算休息檢查的各區域面積
    const restAreas = {
      apex: regionRestValues.apex[0] > 0 ? 1 : 0,
      
      basalAnterior: regionRestValues.basalAnterior[0] > 0 ? 1 : 0,
      middleAnterior: regionRestValues.middleAnterior[0] > 0 ? 1 : 0,
      apicalAnterior: regionRestValues.apicalAnterior[0] > 0 ? 1 : 0,
      
      basalAnteroseptal: regionRestValues.basalAnteroseptal[0] > 0 ? 1 : 0,
      middleAnteroseptal: regionRestValues.middleAnteroseptal[0] > 0 ? 1 : 0,
      apicalAnteroseptal: regionRestValues.apicalAnteroseptal[0] > 0 ? 0.5 : 0,
      
      basalInferoseptal: regionRestValues.basalInferoseptal[0] > 0 ? 1 : 0,
      middleInferoseptal: regionRestValues.middleInferoseptal[0] > 0 ? 1 : 0,
      apicalInferoseptal: regionRestValues.apicalInferoseptal[0] > 0 ? 0.5 : 0,
      
      basalInferior: regionRestValues.basalInferior[0] > 0 ? 1 : 0,
      middleInferior: regionRestValues.middleInferior[0] > 0 ? 1 : 0,
      apicalInferior: regionRestValues.apicalInferior[0] > 0 ? 1 : 0,
      
      basalInferolateral: regionRestValues.basalInferolateral[0] > 0 ? 1 : 0,
      middleInferolateral: regionRestValues.middleInferolateral[0] > 0 ? 1 : 0,
      apicalInferolateral: regionRestValues.apicalInferolateral[0] > 0 ? 0.5 : 0,
      
      basalAnterolateral: regionRestValues.basalAnterolateral[0] > 0 ? 1 : 0,
      middleAnterolateral: regionRestValues.middleAnterolateral[0] > 0 ? 1 : 0,
      apicalAnterolateral: regionRestValues.apicalAnterolateral[0] > 0 ? 0.5 : 0
    };
    
    // 計算各血管區域的總面積
    const vesselStressAreas = {
      LAD: stressAreas.apex + 
           stressAreas.basalAnterior + stressAreas.middleAnterior + stressAreas.apicalAnterior + 
           stressAreas.basalAnteroseptal + stressAreas.middleAnteroseptal + stressAreas.apicalAnteroseptal,
      
      RCA: stressAreas.basalInferoseptal + stressAreas.middleInferoseptal + stressAreas.apicalInferoseptal + 
           stressAreas.basalInferior + stressAreas.middleInferior + stressAreas.apicalInferior,
      
      LCX: stressAreas.basalInferolateral + stressAreas.middleInferolateral + stressAreas.apicalInferolateral + 
           stressAreas.basalAnterolateral + stressAreas.middleAnterolateral + stressAreas.apicalAnterolateral
    };
    
    const vesselRestAreas = {
      LAD: restAreas.apex + 
           restAreas.basalAnterior + restAreas.middleAnterior + restAreas.apicalAnterior + 
           restAreas.basalAnteroseptal + restAreas.middleAnteroseptal + restAreas.apicalAnteroseptal,
      
      RCA: restAreas.basalInferoseptal + restAreas.middleInferoseptal + restAreas.apicalInferoseptal + 
           restAreas.basalInferior + restAreas.middleInferior + restAreas.apicalInferior,
      
      LCX: restAreas.basalInferolateral + restAreas.middleInferolateral + restAreas.apicalInferolateral + 
           restAreas.basalAnterolateral + restAreas.middleAnterolateral + restAreas.apicalAnterolateral
    };
    
    // 計算綜合面積（取應力和休息的最大值）
    const vesselOverallAreas = {
      LAD: Math.max(stressAreas.apex, restAreas.apex) + 
           Math.max(stressAreas.basalAnterior, restAreas.basalAnterior) + 
           Math.max(stressAreas.middleAnterior, restAreas.middleAnterior) + 
           Math.max(stressAreas.apicalAnterior, restAreas.apicalAnterior) + 
           Math.max(stressAreas.basalAnteroseptal, restAreas.basalAnteroseptal) + 
           Math.max(stressAreas.middleAnteroseptal, restAreas.middleAnteroseptal) + 
           Math.max(stressAreas.apicalAnteroseptal, restAreas.apicalAnteroseptal),
      
      RCA: Math.max(stressAreas.basalInferoseptal, restAreas.basalInferoseptal) + 
           Math.max(stressAreas.middleInferoseptal, restAreas.middleInferoseptal) + 
           Math.max(stressAreas.apicalInferoseptal, restAreas.apicalInferoseptal) + 
           Math.max(stressAreas.basalInferior, restAreas.basalInferior) + 
           Math.max(stressAreas.middleInferior, restAreas.middleInferior) + 
           Math.max(stressAreas.apicalInferior, restAreas.apicalInferior),
      
      LCX: Math.max(stressAreas.basalInferolateral, restAreas.basalInferolateral) + 
           Math.max(stressAreas.middleInferolateral, restAreas.middleInferolateral) + 
           Math.max(stressAreas.apicalInferolateral, restAreas.apicalInferolateral) + 
           Math.max(stressAreas.basalAnterolateral, restAreas.basalAnterolateral) + 
           Math.max(stressAreas.middleAnterolateral, restAreas.middleAnterolateral) + 
           Math.max(stressAreas.apicalAnterolateral, restAreas.apicalAnterolateral)
    };
    
    return {
      stressAreas,
      restAreas,
      vesselStressAreas,
      vesselRestAreas,
      vesselOverallAreas
    };
  }
  
  const areaCalculations = calculateAreas();
  
  // 分析各區域的血流狀況
  function analyzeVessels() {
    const analysis = {};
    
    // 嚴重程度詞彙表
    const severityTerms = {
      "1,1": "mildly decreased perfusion",
      "1,2": "mildly to moderately decreased perfusion",
      "1,3": "mildly to severely decreased perfusion",
      "2,2": "moderately decreased perfusion",
      "2,3": "moderately to severely decreased perfusion",
      "3,3": "severely decreased perfusion"
    };
    
    // 分析每個血管區域
    Object.keys(vesselRegions).forEach(vessel => {
      // 提取該血管區域的應力值和休息值
      const stressVals = vesselStressValues[vessel];
      const restVals = vesselRestValues[vessel];
      
      // 計算缺損數
      const stressDefectCount = stressVals.filter(v => v > 0).length;
      const restDefectCount = restVals.filter(v => v > 0).length;
      
      // 計算嚴重程度（最小和最大非零值）
      const nonZeroStressVals = stressVals.filter(v => v > 0);
      const nonZeroRestVals = restVals.filter(v => v > 0);
      
      const stressSeverity = nonZeroStressVals.length > 0 
        ? { min: Math.min(...nonZeroStressVals), max: Math.max(...nonZeroStressVals) }
        : { min: 0, max: 0 };
        
      const restSeverity = nonZeroRestVals.length > 0
        ? { min: Math.min(...nonZeroRestVals), max: Math.max(...nonZeroRestVals) }
        : { min: 0, max: 0 };
      
      // 計算差異值
      const differences = stressVals.map((v, i) => restVals[i] - v);
      const isAnyPositive = differences.some(d => d > 0);
      const isAnyNegative = differences.some(d => d < 0);
      
      // 確定受影響的區域
      const affectedRegions = [];
      vesselRegions[vessel].forEach(region => {
        const stressHasDefect = regionStressValues[region].some(v => v > 0);
        const restHasDefect = regionRestValues[region].some(v => v > 0);
        
        if (stressHasDefect || restHasDefect) {
          // 提取基本區域名稱（去除basal/middle/apical前綴）
          const baseRegion = region.replace(/^(basal|middle|apical)/, "").toLowerCase();
          if (!affectedRegions.includes(baseRegion)) {
            affectedRegions.push(baseRegion);
          }
        }
      });
      
      // 計算區域大小字符串
      const areaSize = areaCalculations.vesselStressAreas[vessel];
      const areaSizeStr = areaSize < 2.5 ? "small" : areaSize < 4.5 ? "medium" : "large";
      
      // 計算整體區域大小
      const overallAreaSize = areaCalculations.vesselOverallAreas[vessel];
      const overallAreaSizeStr = overallAreaSize < 2.5 ? "small" : overallAreaSize < 4.5 ? "medium" : "large";
      
      // 生成嚴重程度字符串
      const stressSeverityStr = stressSeverity.min > 0 ? `${stressSeverity.min},${stressSeverity.max}` : "0,0";
      const restSeverityStr = restSeverity.min > 0 ? `${restSeverity.min},${restSeverity.max}` : "0,0";
      
      // 綜合嚴重程度（取應力和休息的較大值）
      const overallSeverity = {
        min: Math.max(stressSeverity.min, restSeverity.min),
        max: Math.max(stressSeverity.max, restSeverity.max)
      };
      
      const overallSeverityStr = overallSeverity.min > 0 ? `${overallSeverity.min},${overallSeverity.max}` : "0,0";
      
      // 搜集分析結果
      analysis[vessel] = {
        stressDefectCount,
        restDefectCount,
        stressSeverity,
        restSeverity,
        overallSeverity,
        stressSeverityStr,
        restSeverityStr,
        overallSeverityStr,
        severityText: stressSeverityStr !== "0,0" ? severityTerms[stressSeverityStr] || "decreased perfusion" : "",
        restSeverityText: restSeverityStr !== "0,0" ? severityTerms[restSeverityStr] || "decreased perfusion" : "",
        overallSeverityText: overallSeverityStr !== "0,0" ? severityTerms[overallSeverityStr] || "decreased perfusion" : "",
        differences,
        isAnyPositive,
        isAnyNegative,
        affectedRegions,
        areaSize,
        areaSizeStr,
        overallAreaSize,
        overallAreaSizeStr,
        displayRegions: regionDisplayNames[vessel].filter(r => affectedRegions.includes(r))
      };
    });
    
    return analysis;
  }
  
  const vesselAnalysis = analyzeVessels();
  
  // 生成發現文本
  const findings = generateFindingsTextMPI(vesselAnalysis);
  
  // 生成印象文本
  const impression = generateImpressionTextMPI(vesselAnalysis, vesselStressValues, vesselRestValues);
  
  return {
    findings: findings,
    impression: impression
  };
}

/**
 * 按照 MPI sample.txt 的邏輯生成發現文本
 */
function generateFindingsTextMPI(analysis) {
  // 獲取當前的藥物選擇
  const medicationValue = document.getElementById('medicationSelect').value;
  // 如果不是使用 Persantin，將 stress 改為 initial
  const imageType = medicationValue === "Persantin" ? "stress" : "initial";
  
  // 嚴重程度詞彙表
  const severityTerms = {
    "1,1": "mildly decreased perfusion",
    "1,2": "mildly to moderately decreased perfusion",
    "1,3": "mildly to severely decreased perfusion",
    "2,2": "moderately decreased perfusion",
    "2,3": "moderately to severely decreased perfusion",
    "3,3": "severely decreased perfusion"
  };
  
  // 應力檢查發現 - 按嚴重程度分組
  const stressFindings = {};
  Object.keys(analysis).forEach(vessel => {
    const data = analysis[vessel];
    
    if (data.stressDefectCount > 0) {
      const severityText = data.severityText;
      
      if (!stressFindings[severityText]) {
        stressFindings[severityText] = [];
      }
      
      // 構建區域描述
      const regionText = data.displayRegions.join("/") + 
                         (data.displayRegions.length > 1 ? " regions" : " region") + 
                         ` (${data.areaSizeStr})`;
      
      stressFindings[severityText].push(regionText);
    }
  });
  
  // 嚴重程度順序
  const severityOrder = [
    "severely decreased perfusion", 
    "moderately to severely decreased perfusion", 
    "moderately decreased perfusion", 
    "mildly to severely decreased perfusion", 
    "mildly to moderately decreased perfusion", 
    "mildly decreased perfusion"
  ];
  
  // 組合嚴重程度和區域
  const stressDescriptions = [];
  severityOrder.forEach(severity => {
    if (stressFindings[severity] && stressFindings[severity].length > 0) {
      stressDescriptions.push(`${severity} in ${formatStringArray(stressFindings[severity])}`);
    }
  });
  
  // 休息檢查再分佈發現
  const redistributionFindings = {};
  Object.keys(analysis).forEach(vessel => {
    const data = analysis[vessel];
    
    // 跳過沒有缺損的區域
    if (data.stressDefectCount === 0 && data.restDefectCount === 0) {
      return;
    }
    
    let redistributionPattern = "";
    
    // 構建區域描述
    const regionText = data.displayRegions.join("/") + 
                       (data.displayRegions.length > 1 ? " regions" : " region") + 
                       ` (${data.overallAreaSizeStr})`;
    
    // 應力期沒有缺損，但休息期有 (反向再分佈)
    if (data.stressDefectCount === 0 && data.restDefectCount > 0) {
      redistributionPattern = data.restSeverityText;
    } 
    // 應力期有缺損
    else if (data.stressDefectCount > 0) {
      // 再分佈惡化 (progression)
      if (data.isAnyPositive && !data.isAnyNegative) {
        redistributionPattern = `progression of ${data.restSeverityText}`;
      } 
      // 無再分佈變化 (no redistribution)
      else if (!data.isAnyPositive && !data.isAnyNegative) {
        redistributionPattern = "no redistribution";
      } 
      // 完全再分佈恢復 (complete redistribution)
      else if (!data.isAnyPositive && data.restDefectCount === 0) {
        redistributionPattern = "complete redistribution";
      } 
      // 部分再分佈同時部分進展 (mixed pattern)
      else if (data.isAnyPositive && data.isAnyNegative) {
        redistributionPattern = `partial redistribution while partial progression of ${data.restSeverityText}`;
      }
      // 部分再分佈 (partial redistribution)
      else {
        redistributionPattern = "partial redistribution";
      }
    }
    
    if (redistributionPattern) {
      if (!redistributionFindings[redistributionPattern]) {
        redistributionFindings[redistributionPattern] = [];
      }
      redistributionFindings[redistributionPattern].push(regionText);
    }
  });
  
  // 再分佈模式排序
  const redistributionOrder = [
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
    "mildly decreased perfusion"
  ];
  
  // 組合再分佈發現
  const redistributionDescriptions = [];
  
  // 先處理合併相同模式的描述
  const redistributionGroups = {};
  
  // 根據順序處理每種模式
  redistributionOrder.forEach(pattern => {
    // 完全匹配的模式
    if (redistributionFindings[pattern] && redistributionFindings[pattern].length > 0) {
      redistributionGroups[pattern] = formatStringArray(redistributionFindings[pattern]);
    }
    // 匹配前綴的模式，如所有以 "progression of" 或 "partial redistribution while" 開頭的
    else if (pattern.includes("progression of") || pattern.includes("partial redistribution while")) {
      Object.keys(redistributionFindings).forEach(key => {
        if (key.includes(pattern) && !redistributionGroups[key]) {
          redistributionGroups[key] = formatStringArray(redistributionFindings[key]);
        }
      });
    }
  });
  
  // 檢查是否有複合模式未被處理（未在predefinedOrder中的模式）
  Object.keys(redistributionFindings).forEach(pattern => {
    if (!Object.keys(redistributionGroups).some(group => pattern.includes(group))) {
      // 如果有"partial redistribution while"這類的複合模式，單獨處理
      if (pattern.includes("partial redistribution while")) {
        redistributionGroups[pattern] = formatStringArray(redistributionFindings[pattern]);
      }
    }
  });
  
  // 按照指定順序組合描述
  redistributionOrder.forEach(pattern => {
    if (redistributionGroups[pattern]) {
      redistributionDescriptions.push(`${pattern} in ${redistributionGroups[pattern]}`);
    }
  });
  
  // 確保任何未被上面處理的pattern也加入描述中
  Object.keys(redistributionGroups).forEach(pattern => {
    if (!redistributionDescriptions.some(desc => desc.startsWith(pattern))) {
      redistributionDescriptions.push(`${pattern} in ${redistributionGroups[pattern]}`);
    }
  });
  
  // 合併最終描述
  let findingsText = "";
  
  if (stressDescriptions.length === 0) {
    findingsText += `The ${imageType} images disclosed no perfusion defect.\n`;
  } else {
    findingsText += `The ${imageType} images disclosed ` + stressDescriptions.join("; ") + ".\n";
  }
  
  // 確保所有再分佈模式都能正確顯示
  if (redistributionDescriptions.length === 0 && Object.keys(redistributionFindings).length === 0) {
    findingsText += "The delayed images disclosed no perfusion defect.";
  } else {
    findingsText += "The delayed images disclosed " + redistributionDescriptions.join("; ") + ".";
  }
  
  // 當應力期和休息期都沒有缺損時，合併為一個句子
  if (stressDescriptions.length === 0 && redistributionDescriptions.length === 0 && Object.keys(redistributionFindings).length === 0) {
    findingsText = `The ${imageType} and delayed images disclosed no perfusion defect.`;
  }

  // 調試輸出
  console.log("Redistribution patterns:", Object.keys(redistributionFindings));
  console.log("Redistribution descriptions:", redistributionDescriptions);
  
  return findingsText;
}

/**
 * 按照 MPI sample.txt 的邏輯生成結論文本
 */
function generateImpressionTextMPI(analysis, vesselStressValues, vesselRestValues) {
  const diagnoses = [];
  
  // 先按血管區域排序：LAD、RCA、LCX
  const vesselOrder = ["LAD", "RCA", "LCX"];
  
  // 診斷類型排序（由高優先級到低優先級）
  const diagnosisTypeOrder = [
    "myocardial ischemia",
    "mixed viable and non-viable myocardial tissues",
    "non-viable myocardial tissues",
    "reverse redistribution"
  ];
  
  // 按照指定順序處理血管區域
  vesselOrder.forEach(vessel => {
    if (!analysis[vessel]) return;
    
    const data = analysis[vessel];
    
    // 跳過沒有任何缺損的區域
    if (data.stressDefectCount === 0 && data.restDefectCount === 0) {
      return;
    }
    
    // 生成區域描述
    const regionText = data.displayRegions.join("/") + 
                       (data.displayRegions.length > 1 ? " regions" : " region") + 
                       ` (${data.overallAreaSizeStr})`;
    
    // 嚴重程度表述
    const severityPrefix = data.stressSeverity.max === 1 ? "Mild" : 
                           data.stressSeverity.max === 2 ? "Moderate" : 
                           data.stressSeverity.max === 3 ? "Severe" : "";
    
    // 生成診斷描述
    // 應力期無缺損但休息期有 (反向再分佈)
    if (data.stressDefectCount === 0 && data.restDefectCount > 0) {
      // 如果應力期沒有缺損，嚴重程度前綴可能為空，這時候使用休息期的嚴重程度，或者默認為"Mild"
      const prefixToUse = severityPrefix || 
                        (data.restSeverity.max === 2 ? "Moderate" : 
                         data.restSeverity.max === 3 ? "Severe" : "Mild");
      diagnoses.push({
        type: "reverse redistribution",
        severity: getWeightFromPrefix(prefixToUse),
        text: `${prefixToUse} reverse redistribution in ${regionText}`,
        vessel: vessel
      });
    } 
    // 應力期有缺損
    else if (data.stressDefectCount > 0) {
      // 完全再分佈恢復 (complete redistribution) - 心肌缺血
      if (!data.isAnyPositive && data.restDefectCount === 0) {
        diagnoses.push({
          type: "myocardial ischemia",
          severity: getWeightFromPrefix(severityPrefix),
          text: `${severityPrefix} myocardial ischemia in ${regionText}`,
          vessel: vessel
        });
      } 
      // 無再分佈 (no redistribution) - 非活性心肌組織
      else if (!data.isAnyPositive && !data.isAnyNegative) {
        diagnoses.push({
          type: "non-viable myocardial tissues",
          severity: getWeightFromPrefix(severityPrefix),
          text: `${severityPrefix} non-viable myocardial tissues in ${regionText}`,
          vessel: vessel
        });
      } 
      // 部分再分佈或進展 - 混合活性和非活性組織
      else {
        diagnoses.push({
          type: "mixed viable and non-viable myocardial tissues",
          severity: getWeightFromPrefix(severityPrefix),
          text: `${severityPrefix} mixed viable and non-viable myocardial tissues in ${regionText}`,
          vessel: vessel
        });
      }
    }
  });
  
  // 如果沒有診斷，表示正常
  if (diagnoses.length === 0) {
    return "Normal myocardial perfusion study.";
  }
  
  // 按多級排序：1.嚴重程度 2.診斷類型 3.血管區域
  const sortedDiagnoses = diagnoses.sort((a, b) => {
    // 計算每個診斷的綜合分數（加權合計）
    function calculateScore(diagnosis) {
      // 從原始數據中獲取stress和rest的值
      const vessel = diagnosis.vessel;
      // 使用傳入的參數而非全局變數
      const stressVals = vesselStressValues[vessel]; // 取得所有segment的值
      const restVals = vesselRestValues[vessel]; // 取得所有segment的值
      
      // stress圖像權重更高 (stress係數3，rest係數1)
      const stressWeight = 3;
      const restWeight = 1;
      
      // 計算加權總和的嚴重程度 (對每個segment進行加總)
      let severitySum = 0;
      for (let i = 0; i < stressVals.length; i++) {
        severitySum += stressVals[i] * stressWeight;
      }
      for (let i = 0; i < restVals.length; i++) {
        severitySum += restVals[i] * restWeight;
      }
      const severityScore = severitySum * 15; // 總分值權重調整
      
      // 區域大小權重：large(3分) > medium(2分) > small(1分)
      const sizeScore = diagnosis.text.includes("large") ? 30 :
                        diagnosis.text.includes("medium") ? 20 : 10;
      
      // 診斷類型權重：缺血(4分) > 混合組織(3分) > 非活性組織(2分) > 反向再分佈(1分)
      const typeOrder = diagnosisTypeOrder.indexOf(diagnosis.type);
      const typeScore = (4 - typeOrder) * 10; // 類型得分，最高40分
      
      // 血管區域重要性：LAD(3分) > RCA(2分) > LCX(1分)
      const vesselScore = (3 - vesselOrder.indexOf(diagnosis.vessel));
      
      console.log(`Diagnosis: ${diagnosis.text}, Stress總和: ${stressVals.reduce((a, b) => a + b, 0)}, Rest總和: ${restVals.reduce((a, b) => a + b, 0)}, Score: ${severityScore + typeScore + sizeScore + vesselScore}`);
      
      // 綜合分數
      return severityScore + typeScore + sizeScore + vesselScore;
    }
    
    // 根據加權總分排序（降序）
    return calculateScore(b) - calculateScore(a);
  });
  
  // 加上編號並組合最終文本
  return sortedDiagnoses
    .map((diagnosis, index) => `${index + 1}. ${capitalizeFirstCharacter(diagnosis.text)}.`)
    .join("\n");
}

/**
 * 根據嚴重程度前綴獲取權重值
 * @param {string} prefix - 嚴重程度前綴
 * @returns {number} 權重值
 */
function getWeightFromPrefix(prefix) {
  if (prefix.startsWith("Severe")) return 3;
  if (prefix.startsWith("Moderate")) return 2;
  if (prefix.startsWith("Mild")) return 1;
  return 0;
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
 * 判斷數組中是否有大於零的元素
 * @param {number[]} arr - 數字數組
 * @returns {boolean} 如果數組中有大於零的元素，則返回 true
 */
function isAnyElementGreaterThanZero(arr) {
  return arr.some(element => element > 0);
}

/**
 * 判斷數組中是否有小於零的元素
 * @param {number[]} arr - 數字數組
 * @returns {boolean} 如果數組中有小於零的元素，則返回 true
 */
function isAnyElementLessThanZero(arr) {
  return arr.some(element => element < 0);
}

/**
 * 合併兩個數組並去除重複項
 * @param {Array} arr1 - 第一個數組
 * @param {Array} arr2 - 第二個數組
 * @returns {Array} 合併後無重複的數組
 */
function mergeAndRemoveDuplicates(arr1, arr2) {
  return Array.from(new Set(arr1.concat(arr2)));
}

/**
 * 比較兩個數組的對應元素，返回較大的元素
 * @param {number[]} arr1 - 第一個數組
 * @param {number[]} arr2 - 第二個數組
 * @returns {number[]} 每個位置取較大值的新數組
 */
function compareArraysAndReturnLargerElements(arr1, arr2) {
  return arr1.map((element, index) => Math.max(element, arr2[index] || 0));
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