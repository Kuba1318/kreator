const config = {
  stages: ['budowa', 'deweloperski', 'wykończone'],
  series: ['Seria A', 'Seria B', 'Seria C'],
  seriesFrameTypes: {
    'Seria A': ['Ramka 1', 'Ramka 2'],
    'Seria B': ['Ramka 2', 'Ramka 3'],
    'Seria C': ['Ramka 1', 'Ramka 3']
  },
  rooms: ['salon', 'sypialnia', 'kuchnia', 'łazienka', 'garaż', 'biuro'],
  components: {
    salon: [
      { name: 'Gniazdko elektryczne', price: { budowa: 20, deweloperski: 25, wykończone: 30 } },
      { name: 'Włącznik światła', price: { budowa: 15, deweloperski: 18, wykończone: 22 } },
      { name: 'Listwa LED', price: { budowa: 60, deweloperski: 70, wykończone: 85 } }
    ],
    sypialnia: [
      { name: 'Gniazdko z USB', price: { budowa: 28, deweloperski: 33, wykończone: 40 } },
      { name: 'Czujnik dymu', price: { budowa: 50, deweloperski: 58, wykończone: 65 } },
      { name: 'Rolety elektryczne', price: { budowa: 200, deweloperski: 230, wykończone: 260 } }
    ],
    kuchnia: [
      { name: 'Gniazdko siłowe', price: { budowa: 40, deweloperski: 45, wykończone: 55 } },
      { name: 'Oświetlenie podszafkowe', price: { budowa: 80, deweloperski: 95, wykończone: 110 } },
      { name: 'Okap', price: { budowa: 300, deweloperski: 340, wykończone: 370 } }
    ],
    łazienka: [
      { name: 'Gniazdko z osłoną', price: { budowa: 25, deweloperski: 30, wykończone: 38 } },
      { name: 'Ogrzewanie podłogowe', price: { budowa: 500, deweloperski: 560, wykończone: 620 } },
      { name: 'Lustro z LED', price: { budowa: 180, deweloperski: 200, wykończone: 230 } }
    ],
    garaż: [
      { name: 'Lampka warsztatowa', price: { budowa: 70, deweloperski: 80, wykończone: 95 } },
      { name: 'Gniazdko przemysłowe', price: { budowa: 60, deweloperski: 70, wykończone: 80 } }
    ],
    biuro: [
      { name: 'Listwa zasilająca', price: { budowa: 35, deweloperski: 40, wykończone: 48 } },
      { name: 'Router', price: { budowa: 120, deweloperski: 140, wykończone: 160 } },
      { name: 'Kamera IP', price: { budowa: 250, deweloperski: 280, wykończone: 320 } }
    ]
  }
};

let selectedStage = '';
let selectedSeries = '';
let selectedFrameType = '';
let rooms = [];
let roomsComponents = {};
let selectedServices = [];

// --- ZAPIS I ODCZYT Z LOCALSTORAGE ---

function saveToLocalStorage() {
  const data = {
    selectedStage,
    selectedSeries,
    selectedFrameType,
    rooms,
    roomsComponents,
    selectedServices
  };
  localStorage.setItem('configuratorData', JSON.stringify(data));
}

function loadFromLocalStorage() {
  const data = localStorage.getItem('configuratorData');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      selectedStage = parsed.selectedStage || '';
      selectedSeries = parsed.selectedSeries || '';
      selectedFrameType = parsed.selectedFrameType || '';
      rooms = parsed.rooms || [];
      roomsComponents = parsed.roomsComponents || {};
      selectedServices = parsed.selectedServices || [];
    } catch (e) {
      localStorage.removeItem('configuratorData');
    }
  }
}

// --- KROK 1 ---

function selectStage(stage) {
  selectedStage = stage;
  document.querySelectorAll('.stage-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.stage === stage);
  });
  validateStep1();
  saveToLocalStorage();
}

function selectSeries(val) {
  selectedSeries = val;
  updateFrameTypeOptions();
  if (!config.seriesFrameTypes[selectedSeries] || config.seriesFrameTypes[selectedSeries].indexOf(selectedFrameType) === -1) {
    selectedFrameType = '';
    document.getElementById('frameTypeSelect').value = '';
  }
  validateStep1();
  saveToLocalStorage();
}

function updateFrameTypeOptions() {
  const frameTypeSelect = document.getElementById('frameTypeSelect');
  frameTypeSelect.innerHTML = `<option value="">-- wybierz typ ramki --</option>`;
  if (selectedSeries && config.seriesFrameTypes[selectedSeries]) {
    config.seriesFrameTypes[selectedSeries].forEach(frameType => {
      frameTypeSelect.innerHTML += `<option value="${frameType}">${frameType}</option>`;
    });
  }
}

function selectFrameType(val) {
  selectedFrameType = val;
  validateStep1();
  saveToLocalStorage();
}

function addRoom() {
  const roomId = Date.now();
  const roomList = document.getElementById('roomList');
  const div = document.createElement('div');
  div.className = 'room-item';
  div.id = `room-item-${roomId}`;
  div.innerHTML = `
    <select onchange="updateRoomType(${roomId}, this.value)">
      <option value="">-- wybierz pomieszczenie --</option>
      ${config.rooms.map(room => `<option value="${room}">${room.charAt(0).toUpperCase() + room.slice(1)}</option>`).join('')}
    </select>
    <button onclick="removeRoom(${roomId})">Usuń</button>
  `;
  roomList.appendChild(div);
  rooms.push({ id: roomId, type: '' });
  validateStep1();
  saveToLocalStorage();
}

function updateRoomType(roomId, type) {
  const room = rooms.find(r => r.id === roomId);
  if (room) room.type = type;
  validateStep1();
  saveToLocalStorage();
}

function removeRoom(roomId) {
  document.getElementById(`room-item-${roomId}`).remove();
  rooms = rooms.filter(r => r.id !== roomId);
  delete roomsComponents[roomId];
  validateStep1();
  saveToLocalStorage();
}

function validateStep1() {
  const proceedBtn = document.getElementById('proceedBtn');
  const valid = selectedStage && selectedSeries && selectedFrameType && rooms.length > 0 && rooms.every(r => r.type);
  proceedBtn.disabled = !valid;
}

// --- KROK 2 ---

function goToStep2() {
  document.getElementById('step1').classList.add('hidden');
  document.getElementById('step2').classList.remove('hidden');
  renderRoomsForComponents();
  saveToLocalStorage();
}

function goToStep1() {
  document.getElementById('step2').classList.add('hidden');
  document.getElementById('step1').classList.remove('hidden');
  saveToLocalStorage();
}

function renderRoomsForComponents() {
  const container = document.getElementById('roomsContainer');
  container.innerHTML = '';
  rooms.forEach(room => {
    const section = document.createElement('div');
    section.className = 'room-section';
    section.id = `room-section-${room.id}`;
    section.onclick = () => toggleComponents(room.id);
    section.innerHTML = `
      <b>${room.type.charAt(0).toUpperCase() + room.type.slice(1)}</b>
      <div id="components-list-${room.id}" class="components-list hidden"></div>
    `;
    container.appendChild(section);
  });
  updateSummary();
}

// --- KOMPONENTY I ILOŚCI ---

function toggleComponents(roomId) {
  const list = document.getElementById(`components-list-${roomId}`);
  if (!list.innerHTML) {
    const room = rooms.find(r => r.id === roomId);
    list.innerHTML = config.components[room.type].map(comp => {
      let qty = 0;
      if (roomsComponents[roomId]) {
        const found = roomsComponents[roomId].find(c => c.component.name === comp.name);
        if (found) qty = found.qty;
      }
      return `
        <label style="display:block;">
          <input type="checkbox" onclick="event.stopPropagation()" onchange="selectComponent(${roomId}, '${comp.name}', this.checked)" ${qty > 0 ? 'checked' : ''}>
          ${comp.name} <span style="color:#888;">(${comp.price[selectedStage]} zł/szt.)</span>
          <input type="number" min="1" max="99" value="${qty > 0 ? qty : 1}" 
            style="width:50px; margin-left:10px;" 
            ${qty > 0 ? '' : 'disabled'}
            onclick="event.stopPropagation()"
            onchange="changeQty(${roomId}, '${comp.name}', this.value)">
          szt.
        </label>
      `;
    }).join('');
  }
  list.classList.toggle('hidden');
  document.getElementById(`room-section-${roomId}`).classList.toggle('active');
}

function selectComponent(roomId, componentName, checked) {
  if (!roomsComponents[roomId]) roomsComponents[roomId] = [];
  const room = rooms.find(r => r.id === roomId);
  const compObj = config.components[room.type].find(c => c.name === componentName);
  let compArr = roomsComponents[roomId];
  let found = compArr.find(c => c.component.name === componentName);

  const inputQty = findQtyInput(roomId, componentName);

  if (checked) {
    if (!found) {
      compArr.push({ component: compObj, qty: parseInt(inputQty.value) || 1 });
    }
    inputQty.disabled = false;
  } else {
    roomsComponents[roomId] = compArr.filter(c => c.component.name !== componentName);
    inputQty.disabled = true;
  }
  updateSummary();
  saveToLocalStorage();
}

function changeQty(roomId, componentName, value) {
  if (!roomsComponents[roomId]) return;
  const compArr = roomsComponents[roomId];
  let found = compArr.find(c => c.component.name === componentName);
  if (found) {
    found.qty = parseInt(value) || 1;
    updateSummary();
    saveToLocalStorage();
  }
}

function findQtyInput(roomId, componentName) {
  const list = document.getElementById(`components-list-${roomId}`);
  const labels = list.querySelectorAll('label');
  for (let label of labels) {
    if (label.textContent.includes(componentName)) {
      return label.querySelector('input[type="number"]');
    }
  }
  return null;
}

// --- PODSUMOWANIE I PRZYCISK DALEJ ---

function updateSummary() {
  const summaryDiv = document.getElementById('summary');
  let total = 0;
  let html = `<h3>Podsumowanie konfiguracji</h3>
    <p><b>Etap budowy:</b> ${selectedStage ? selectedStage.charAt(0).toUpperCase() + selectedStage.slice(1) : ''}</p>
    <p><b>Seria:</b> ${selectedSeries ? selectedSeries : ''} &nbsp; <b>Typ ramki:</b> ${selectedFrameType ? selectedFrameType : ''}</p>`;
  rooms.forEach(room => {
    const comps = roomsComponents[room.id] || [];
    if (comps.length) {
      html += `<div style="margin: 10px 0 10px 20px;">
        <b>${room.type.charAt(0).toUpperCase() + room.type.slice(1)}:</b>
        <ul>
          ${comps.map(c => {
            const sum = c.qty * c.component.price[selectedStage];
            total += sum;
            return `<li>${c.component.name} – ${c.qty} szt. x ${c.component.price[selectedStage]} zł = <b>${sum} zł</b></li>`;
          }).join('')}
        </ul>
      </div>`;
    }
  });
  html += `<div style="margin:20px 0 0 20px;"><b>SUMA: ${total} zł</b></div>`;
  summaryDiv.innerHTML = html;
  document.getElementById('nextBtn').disabled = !Object.values(roomsComponents).some(arr => arr.length > 0);
}

// --- USŁUGI DODATKOWE I EKRAN KOŃCOWY ---

function goToServices() {
  const wantsServices = confirm("Czy chcesz wybrać usługi dodatkowe?");
  document.getElementById('step2').classList.add('hidden');
  if (wantsServices) {
    document.getElementById('stepServices').classList.remove('hidden');
  } else {
    goToSummary();
  }
}

function goToSummary() {
  selectedServices = [];
  if (document.getElementById('servicesForm')) {
    document.querySelectorAll('#servicesForm input[type=checkbox]:checked').forEach(cb => {
      selectedServices.push(cb.value);
    });
  }

  document.getElementById('stepServices').classList.add('hidden');
  document.getElementById('step2').classList.add('hidden');
  document.getElementById('stepEnd').classList.remove('hidden');
  renderFinalSummary();
  saveToLocalStorage();
}

function renderFinalSummary() {
  let html = `<h4>Wybrane usługi dodatkowe:</h4>`;
  if (selectedServices.length > 0) {
    html += `<ul>${selectedServices.map(s => `<li>${s}</li>`).join('')}</ul>`;
  } else {
    html += `<p>Brak usług dodatkowych.</p>`;
  }
  html += document.getElementById('summary').innerHTML;
  document.getElementById('finalSummary').innerHTML = html;
}

// --- ODTWORZENIE STANU PO ZAŁADOWANIU STRONY ---

window.onload = function() {
  loadFromLocalStorage();

  if (selectedStage) {
    document.querySelectorAll('.stage-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.stage === selectedStage);
    });
  }
  if (selectedSeries) {
    document.getElementById('seriesSelect').value = selectedSeries;
    updateFrameTypeOptions();
  }
  if (selectedFrameType) {
    document.getElementById('frameTypeSelect').value = selectedFrameType;
  }
  if (rooms && rooms.length > 0) {
    const roomList = document.getElementById('roomList');
    roomList.innerHTML = '';
    rooms.forEach(room => {
      const div = document.createElement('div');
      div.className = 'room-item';
      div.id = `room-item-${room.id}`;
      div.innerHTML = `
        <select onchange="updateRoomType(${room.id}, this.value)">
          <option value="">-- wybierz pomieszczenie --</option>
          ${config.rooms.map(r => `<option value="${r}"${room.type === r ? ' selected' : ''}>${r.charAt(0).toUpperCase() + r.slice(1)}</option>`).join('')}
        </select>
        <button onclick="removeRoom(${room.id})">Usuń</button>
      `;
      roomList.appendChild(div);
    });
  }
  validateStep1();

  if (document.getElementById('step2') && rooms && rooms.length > 0 && Object.keys(roomsComponents).length > 0) {
    renderRoomsForComponents();
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.remove('hidden');
  }
  updateSummary();
};

// --- RESET KONFIGURATORA ---

function resetConfigurator() {
  localStorage.removeItem('configuratorData');
  location.reload();
}

// --- GENEROWANIE PDF Z POLSKIMI ZNAKAMI ---

function downloadFinalPDF() {
  if (typeof jsPDF === 'undefined') {
    alert('jsPDF nie został załadowany!');
    return;
  }
  var doc = new jsPDF();
  // NIE używaj addFileToVFS ani addFont – robi to plik Roboto-Regular-normal.js automatycznie!
  doc.setFont('Roboto-Regular-normal.ttf', 'Roboto-Regular', 'normal'); // dokładnie jak w pliku fontu!
  doc.setFontSize(14);

  let y = 15;
  doc.text("Podsumowanie konfiguracji", 10, y);
  y += 10;
  doc.setFontSize(12);
  doc.text(`Etap budowy: ${selectedStage}`, 10, y);
  y += 8;
  doc.text(`Seria: ${selectedSeries}`, 10, y);
  y += 8;
  doc.text(`Typ ramki: ${selectedFrameType}`, 10, y);
  y += 12;

  // Usługi dodatkowe
  if (typeof selectedServices !== 'undefined') {
    doc.setFont(undefined, 'bold');
    doc.text("Usługi dodatkowe:", 10, y);
    doc.setFont(undefined, 'normal');
    y += 7;
    if (selectedServices.length > 0) {
      selectedServices.forEach(service => {
        doc.text(`- ${service}`, 14, y);
        y += 7;
      });
    } else {
      doc.text("Brak usług dodatkowych.", 14, y);
      y += 7;
    }
    y += 5;
  }

  // Pomieszczenia i komponenty
  let total = 0;
  rooms.forEach(room => {
    const comps = roomsComponents[room.id] || [];
    if (comps.length) {
      if (y > 260) { doc.addPage(); y = 15; }
      doc.setFont(undefined, 'bold');
      doc.text(`${room.type.charAt(0).toUpperCase() + room.type.slice(1)}:`, 10, y);
      doc.setFont(undefined, 'normal');
      y += 7;
      comps.forEach(c => {
        const sum = c.qty * c.component.price[selectedStage];
        doc.text(
          `${c.component.name} – ${c.qty} szt. x ${c.component.price[selectedStage]} zł = ${sum} zł`,
          14, y
        );
        y += 7;
        total += sum;
        if (y > 280) { doc.addPage(); y = 15; }
      });
      y += 3;
    }
  });

  doc.setFont(undefined, 'bold');
  doc.text(`SUMA: ${total} zł`, 10, y + 5);

  doc.save(`podsumowanie-konfiguracji.pdf`);
}
