function saveData() {
  const request = indexedDB.open('storage', 1);
  
  request.onupgradeneeded = e => {
    const db = e.target.result;
    if(!db.objectStoreNames.contains('keyvalue')) {
      db.createObjectStore('keyvalue', { keyPath: 'key' });
    }
  };
  
  request.onsuccess = e => {
    const db = e.target.result;
    
    fetch('/data/data.json')
    .then(res => res.json())
    .then(data => {
      const value = data;
      const entry = { key: 'value', value: value };
      
      const transaction = db.transaction(['keyvalue'], 'readwrite');
      const objectStore = transaction.objectStore('keyvalue');
      objectStore.put(entry);
      
      transaction.oncomplete = () => {
        console.log('データの保存が完了しました');
        dataLoadedHandler(value);
      };
      
      transaction.onerror = () => {
        console.error('データの保存中にエラーが発生しました');
      };
    })
    .catch(e => {
      console.log(e);
    });
  };
  
  request.onerror = () => {
    console.error('データベースの使用に失敗しました');
  };
}

function loadData() {
  const request = indexedDB.open('storage', 1);
  
  request.onsuccess = e => {
    const db = e.target.result;
    const transaction = db.transaction(['keyvalue'], 'readonly');
    const objectStore = transaction.objectStore('keyvalue');
    
    const getRequest = objectStore.get('value');
    
    getRequest.onsuccess = e => {
      const result = e.target.result;
      if(request) {
        console.log('読み込んだデータ: ', result.value);
        dataLoadedHandler(result.value);
      } else {
        console.log('データが見つかりませんでした');
        saveData();
      }
    };
    
    getRequest.onerror = e => {
      console.error('データの読み込み中にエラーが発生しました');
    }
  };
  
  request.onerror = e => {
    console.error('データベースの使用に失敗しました');
  }
}
