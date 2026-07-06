fetch('http://127.0.0.1:5000/api/users/fix-branches').then(res => res.text()).then(console.log).catch(console.error);
