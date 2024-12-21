// DOM要素
const dateInput = document.getElementById('dateInput');
const categoryInput = document.getElementById('categoryInput');
const memoInput = document.getElementById('memoInput');
const amountInput = document.getElementById('amountInput');
const expenseTableBody = document.getElementById('expenseTableBody');
const totalAmountElem = document.getElementById('totalAmount');
const expenseForm = document.getElementById('expenseForm');

let expenses = []; // データ保存用配列
let categoryChart;

// ローカルデータの読み込み
window.addEventListener('load', () => {
  const storedData = localStorage.getItem('expensesData');
  if (storedData) {
    expenses = JSON.parse(storedData);
  }
  renderTable();
});

// フォーム送信イベント
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const dateValue = dateInput.value;
  const categoryValue = categoryInput.value.trim();
  const memoValue = memoInput.value.trim();
  const amountValue = parseFloat(amountInput.value);

  if (!dateValue || !categoryValue || !memoValue || isNaN(amountValue)) {
    alert('入力内容に不備があります。');
    return;
  }

  expenses.push({
    id: Date.now(),
    date: dateValue,
    category: categoryValue,
    memo: memoValue,
    amount: amountValue
  });

  saveData();
  renderTable();
  expenseForm.reset();
});

// テーブル描画
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
  updateChart();
}

// グラフ更新
function updateChart() {
  const categoryData = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const labels = Object.keys(categoryData);
  const data = Object.values(categoryData);

  if (categoryChart) {
    categoryChart.destroy();
  }

  const ctx = document.getElementById('categoryChart').getContext('2d');
  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.raw.toLocaleString()}円`
          }
        }
      }
    }
  });
}

// データ保存
function saveData() {
  localStorage.setItem('expensesData', JSON.stringify(expenses));
}

// データ削除
function deleteExpense(id) {
  expenses = expenses.filter(expense => expense.id !== id);
  saveData();
  renderTable();
}

