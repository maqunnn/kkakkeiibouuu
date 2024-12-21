// DOM要素の取得
const dateInput        = document.getElementById('dateInput');
const categoryInput    = document.getElementById('categoryInput');
const memoInput        = document.getElementById('memoInput');
const amountInput      = document.getElementById('amountInput');
const addButton        = document.getElementById('addButton');
const expenseTableBody = document.getElementById('expenseTableBody');
const totalAmountElem  = document.getElementById('totalAmount');
const expenseForm      = document.getElementById('expenseForm');

// データ保存用配列 (起動時にLocalStorageから読み込み)
let expenses = [];

// ページ読み込み時にLocalStorageからデータを取得
window.addEventListener('load', () => {
  const storedData = localStorage.getItem('expensesData');
  if (storedData) {
    expenses = JSON.parse(storedData);
  }
  renderTable();
});

// フォーム送信(追加ボタン)が押されたときの処理
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault(); // フォームの送信によるリロードを防止

  // 入力値を取得
  const dateValue = dateInput.value;
  const categoryValue = categoryInput.value.trim();
  const memoValue = memoInput.value.trim();
  const amountValue = parseFloat(amountInput.value);

  // バリデーション
  if (!dateValue || !categoryValue || !memoValue || isNaN(amountValue)) {
    alert('入力内容に不備があります。');
    return;
  }

  // 新しい支出オブジェクトを配列に追加
  const newExpense = {
    id: Date.now(), // 一意のIDを付与
    date: dateValue,
    category: categoryValue,
    memo: memoValue,
    amount: amountValue
  };
  expenses.push(newExpense);

  // LocalStorageに保存
  saveData();

  // テーブルを再描画
  renderTable();

  // フォームをリセット
  expenseForm.reset();
});

// テーブル描画関数
function renderTable() {
  // テーブル本体をクリア
  expenseTableBody.innerHTML = '';

  // 合計金額を計算
  let totalAmount = 0;

  // 配列内の支出をすべてテーブルに追加
  expenses.forEach(expense => {
    // 行を作成
    const tr = document.createElement('tr');

    // 日付セル
    const dateTd = document.createElement('td');
    dateTd.textContent = expense.date;
    tr.appendChild(dateTd);

    // カテゴリーセル
    const categoryTd = document.createElement('td');
    categoryTd.textContent = expense.category;
    tr.appendChild(categoryTd);

    // メモセル
    const memoTd = document.createElement('td');
    memoTd.textContent = expense.memo;
    tr.appendChild(memoTd);

    // 金額セル
    const amountTd = document.createElement('td');
    amountTd.textContent = expense.amount.toLocaleString();
    tr.appendChild(amountTd);

    // 削除ボタン
    const deleteTd = document.createElement('td');
    deleteTd.classList.add('text-center');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
    deleteButton.addEventListener('click', () => {
      deleteExpense(expense.id);
    });
    deleteTd.appendChild(deleteButton);
    tr.appendChild(deleteTd);

    // テーブルに行を追加
    expenseTableBody.appendChild(tr);

    // 合計金額に加算
    totalAmount += expense.amount;
  });

  // 合計金額の表示を更新
  totalAmountElem.textContent = totalAmount.toLocaleString();
}

// 支出削除関数
function deleteExpense(id) {
  // 対象の支出を削除
  expenses = expenses.filter(expense => expense.id !== id);
  saveData();
  renderTable();
}

// LocalStorageに保存する関数
function saveData() {
  localStorage.setItem('expensesData', JSON.stringify(expenses));
}

// Chart.jsのグラフ用変数
let categoryChart;

// カテゴリごとのデータを集計
function calculateCategoryData() {
  const categoryData = {};

  expenses.forEach(expense => {
    if (!categoryData[expense.category]) {
      categoryData[expense.category] = 0;
    }
    categoryData[expense.category] += expense.amount;
  });

  return categoryData;
}

// グラフの更新
function updateChart() {
  const categoryData = calculateCategoryData();
  const labels = Object.keys(categoryData);
  const data = Object.values(categoryData);

  // グラフがすでに存在する場合は破棄
  if (categoryChart) {
    categoryChart.destroy();
  }

  // 新しいグラフを作成
  const ctx = document.getElementById('categoryChart').getContext('2d');
  categoryChart = new Chart(ctx, {
    type: 'doughnut', // 円グラフ
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#ff6384',
          '#36a2eb',
          '#ffce56',
          '#4bc0c0',
          '#9966ff',
          '#ff9f40'
        ],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${value.toLocaleString()} 円`;
            }
          }
        }
      }
    }
  });
}

// 既存の関数にグラフ更新を追加
function renderTable() {
  expenseTableBody.innerHTML = '';
  let totalAmount = 0;

  expenses.forEach(expense => {
    const tr = document.createElement('tr');

    const dateTd = document.createElement('td');
    dateTd.textContent = expense.date;
    tr.appendChild(dateTd);

    const categoryTd = document.createElement('td');
    categoryTd.textContent = expense.category;
    tr.appendChild(categoryTd);

    const memoTd = document.createElement('td');
    memoTd.textContent = expense.memo;
    tr.appendChild(memoTd);

    const amountTd = document.createElement('td');
    amountTd.textContent = expense.amount.toLocaleString();
    tr.appendChild(amountTd);

    const deleteTd = document.createElement('td');
    deleteTd.classList.add('text-center');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
    deleteButton.addEventListener('click', () => {
      deleteExpense(expense.id);
    });
    deleteTd.appendChild(deleteButton);
    tr.appendChild(deleteTd);

    expenseTableBody.appendChild(tr);
    totalAmount += expense.amount;
  });

  totalAmountElem.textContent = totalAmount.toLocaleString();

  // グラフを更新
  updateChart();
}

