// 宣告待機圖片精靈圖集的全域變數
let stopSpriteSheet;
// 宣告走路圖片精靈圖集的全域變數
let walkSpriteSheet;

// 設定待機圖片精靈圖檔檔名 (1stop.png)
const STOP_FILE_NAME = '1stop.png';
// 設定待機圖片精靈的總張數（8張）
const STOP_FRAMES = 8;
// 設定待機圖片精靈總圖檔寬度（1107像素）
const STOP_TOTAL_WIDTH = 1107;
// 設定待機圖片精靈總圖檔高度（196像素）
const STOP_HEIGHT = 196;
// 計算待機圖片精靈單張影格的寬度（1107 / 8 = 138.375像素）
const STOP_FRAME_WIDTH = STOP_TOTAL_WIDTH / STOP_FRAMES;

// 設定走路圖片精靈圖檔檔名 (1walk.png)
const WALK_FILE_NAME = '1walk.png';
// 設定走路圖片精靈的總張數（8張）
const WALK_FRAMES = 8;
// 設定走路圖片精靈總圖檔寬度（1107像素）
const WALK_TOTAL_WIDTH = 1107;
// 設定走路圖片精靈總圖檔高度（197像素）
const WALK_HEIGHT = 197;
// 計算走路圖片精靈單張影格的寬度（1107 / 8 = 138.375像素）
const WALK_FRAME_WIDTH = WALK_TOTAL_WIDTH / WALK_FRAMES;

// 宣告角色當前在畫布上的 X 軸座標變數
let xPos;
// 宣告當前播放動畫影格索引的變數
let currentFrame = 0;
// 宣告控制動畫播放速度的計數器變數
let frameTimer = 0;
// 宣告角色每次移動的像素距離（移動速度）
let moveSpeed = 5;

// 宣告當前繪圖縮放比例係數
let scaleFactor = 1;
// 宣告當前角色顯示畫面的計算寬度
let displayWidth = 0;
// 宣告當前角色顯示畫面的計算高度
let displayHeight = 0;

// 宣告角色面對的方向（1 代表面朝右，-1 代表面朝左）
let facingDirection = 1;
// 宣告角色目前是否處於行走移動狀態
let isWalking = false;

// 宣告待機圖檔是否成功載入的旗標（預設為 false）
let stopLoaded = false;
// 宣告走路圖檔是否成功載入的旗標（預設為 false）
let walkLoaded = false;

// p5.js 預載資源函式，在 setup() 執行前預先讀取圖檔
function preload() {
  // 載入待機圖片精靈圖集 1stop.png
  stopSpriteSheet = loadImage(
    STOP_FILE_NAME,
    function() { stopLoaded = true; },   // 成功載入時將旗標設為 true
    function() { stopLoaded = false; }  // 載入失敗時維持 false
  );
  // 載入走路圖片精靈圖集 1walk.png
  walkSpriteSheet = loadImage(
    WALK_FILE_NAME,
    function() { walkLoaded = true; },   // 成功載入時將旗標設為 true
    function() { walkLoaded = false; }  // 載入失敗時維持 false
  );
}

// p5.js 初始化設定函式，網頁載入時僅執行一次
function setup() {
  // 創建全螢幕畫布，寬度與高度符合當前瀏覽器視窗尺寸
  createCanvas(windowWidth, windowHeight);
  // 計算畫布自適應縮放比例與角色顯示尺寸
  updateScale();
  // 將角色的初始 X 座標定位於視窗寬度的 2/3 位置
  xPos = width * (2 / 3);
}

// 根據視窗大小計算自適應縮放比例的自訂函式
function updateScale() {
  // 依據畫布高度計算自適應縮放比例（設定角色顯示高度為畫布高度的 30%）
  scaleFactor = (height * 0.3) / STOP_HEIGHT;
  // 更新當前動態計算後的顯示寬度
  displayWidth = (isWalking ? WALK_FRAME_WIDTH : STOP_FRAME_WIDTH) * scaleFactor;
  // 更新當前動態計算後的顯示高度
  displayHeight = (isWalking ? WALK_HEIGHT : STOP_HEIGHT) * scaleFactor;
}

// p5.js 主要繪製迴圈函式，預設每秒執行約 60 次
function draw() {
  // 設定背景色彩為天空藍 (#87CEEB)
  background(135, 206, 235);

  // 判斷鍵盤按鍵狀態並更新角色位移與狀態
  handleInput();

  // 更新動畫影格計數器
  frameTimer++;
  // 每隔 6 幀切換一次影格，控制動畫循環速度
  if (frameTimer % 6 === 0) {
    // 當前影格索引加 1，並透過餘數運算使其在 0 到 7 之間循環
    currentFrame = (currentFrame + 1) % 8;
  }

  // 計算角色最底部邊界貼齊畫布最底端的 Y 座標位置
  let yPos = height - displayHeight;

  // 保存當前的繪圖畫布狀態矩陣
  push();
  
  // 判斷角色面對方向進行座標系變換與鏡像翻轉
  if (facingDirection === 1) {
    // 當角色朝右時，將座標原點平移至角色左上角 (xPos, yPos)
    translate(xPos, yPos);
  } else {
    // 當角色朝左時，平移至角色右上角 (xPos + displayWidth, yPos)
    translate(xPos + displayWidth, yPos);
    // 進行 X 軸反轉 (水平鏡像翻轉)，Y 軸保持不變
    scale(-1, 1);
  }

  // 根據目前狀態判斷是否載入對應圖檔，執行精靈切片繪製或向量備用角色繪製
  if (isWalking) {
    // 如果目前是走路狀態且 1walk.png 成功載入
    if (walkLoaded) {
      // 計算當前走路影格在精靈圖集中的 X 座標裁切位置
      let sx = currentFrame * WALK_FRAME_WIDTH;
      // 繪製裁切後的走路精靈影格並縮放顯示
      image(
        walkSpriteSheet, 
        0, 0, 
        WALK_FRAME_WIDTH * scaleFactor, WALK_HEIGHT * scaleFactor, 
        sx, 0, 
        WALK_FRAME_WIDTH, WALK_HEIGHT
      );
    } else {
      // 若走路圖檔未載入，繪製自適應向量備用走路角色
      drawFallbackCharacter(true);
    }
  } else {
    // 如果目前是靜止待機狀態且 1stop.png 成功載入
    if (stopLoaded) {
      // 計算當前待機影格在精靈圖集中的 X 座標裁切位置
      let sx = currentFrame * STOP_FRAME_WIDTH;
      // 繪製裁切後的待機精靈影格並縮放顯示
      image(
        stopSpriteSheet, 
        0, 0, 
        STOP_FRAME_WIDTH * scaleFactor, STOP_HEIGHT * scaleFactor, 
        sx, 0, 
        STOP_FRAME_WIDTH, STOP_HEIGHT
      );
    } else {
      // 若待機圖檔未載入，繪製自適應向量備用待機角色
      drawFallbackCharacter(false);
    }
  }

  // 恢復先前保存的繪圖畫布狀態矩陣
  pop();
}

// 處理鍵盤輸入與角色邊界限制的自訂函式
function handleInput() {
  // 檢查是否按下了右方向鍵
  if (keyIsDown(RIGHT_ARROW)) {
    // 設定角色面向右方 (1)
    facingDirection = 1;
    // 設定角色狀態為走路中
    isWalking = true;
    // 角色的 X 座標向右累加移動速度
    xPos += moveSpeed;
    // 限制角色 X 座標不能超過畫布右邊界 (畫布寬度減去角色顯示寬度)
    if (xPos > width - displayWidth) {
      xPos = width - displayWidth;
    }
  } 
  // 檢查是否按下了左方向鍵
  else if (keyIsDown(LEFT_ARROW)) {
    // 設定角色面向左方 (-1)
    facingDirection = -1;
    // 設定角色狀態為走路中
    isWalking = true;
    // 角色的 X 座標向左遞減移動速度
    xPos -= moveSpeed;
    // 限制角色 X 座標不能超過畫布左邊界 (最小為 0)
    if (xPos < 0) {
      xPos = 0;
    }
  } 
  // 若未按下左右方向鍵
  else {
    // 設定角色狀態為靜止待機
    isWalking = false;
  }
  // 根據當前狀態重新更新動態寬高尺寸
  updateScale();
}

// 當視窗大小發生改變時自動觸發的 p5.js 事件函式
function windowResized() {
  // 重新調整畫布尺寸以適應新的視窗大小
  resizeCanvas(windowWidth, windowHeight);
  // 重新計算縮放比例與角色顯示尺寸
  updateScale();
}

// 當外部圖檔尚未準備好時繪製向量備用角色的函式
function drawFallbackCharacter(walking) {
  // 保存當前局部變換狀態
  push();
  // 依據目前縮放比例進行整體座標放大
  scale(scaleFactor);
  
  // 根據走路或靜止狀態設定動作微幅上下晃動偏置
  let bob = walking ? Math.sin(frameCount * 0.3) * 5 : 0;
  
  // 設定繪製身體無外框
  noStroke();
  // 設定身體顏色為番茄紅 (#FF6347)
  fill(255, 99, 71);
  // 繪製角色身體橢圓形
  ellipse(50, 110 + bob, 70, 90);
  
  // 設定頭部顏色為黃金黃 (#FFD700)
  fill(255, 215, 0);
  // 繪製角色頭部圓形
  ellipse(50, 50 + bob, 60, 60);
  
  // 設定眼睛顏色為深灰色
  fill(50);
  // 繪製右眼睛
  ellipse(62, 45 + bob, 8, 8);
  // 繪製左眼睛
  ellipse(42, 45 + bob, 8, 8);
  
  // 設定腳部顏色為深棕色
  fill(100, 50, 0);
  if (walking) {
    // 繪製動態擺動的左右腳
    rect(30 + Math.sin(frameCount * 0.3) * 10, 150, 15, 30, 5);
    rect(55 - Math.sin(frameCount * 0.3) * 10, 150, 15, 30, 5);
  } else {
    // 繪製靜止站立的左右腳
    rect(32, 150, 15, 32, 5);
    rect(53, 150, 15, 32, 5);
  }
  
  // 恢復局部變換狀態
  pop();
}