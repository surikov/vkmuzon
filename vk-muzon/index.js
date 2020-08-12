//disableSaveState = false;
function startApp() {
	console.log('startApp');
	/*window.onload = function () {
		//console.log('create riffshareflat');
		new RiffShareFlat();

		//riffshareflat.init();

	};*/
	vkBridge.send('VKWebAppInit').then(data => {
			console.log('vkBridge data', data);
		})
		.catch(error => {
			console.log('vkBridge error', error);
		});
}

function readStringFromWebDB(name, ondone) {
	try {
		var database = getWebDB();
		database.transaction(function (sqlTransaction) {
			try {
				var sql = 'select ftext from cfg where fname=\'' + name + '\';';
				sqlTransaction.executeSql(sql, [], function (a, b) {
					//console.log(sql, b);
					if (b.rows.length > 0) {
						ondone(b.rows[0].ftext);
					} else {
						ondone(null);
					}
				}, function (a, b) {
					//console.log(a, b);
					ondone(null);
				});
			} catch (e) {
				console.log(e);
				ondone(null);
			}
		});
	} catch (e) {
		console.log(e);
		ondone(null);
	}
}

function saveString2WebDB(name, text, ondone) {
	try {
		var database = getWebDB();
		database.transaction(function (sqlTransaction) {
			try {
				sqlTransaction.executeSql('create table if not exists cfg(fname text, ftext text)');
				sqlTransaction.executeSql('delete from cfg where fname="' + name + '"');
				sqlTransaction.executeSql('insert into cfg (fname,ftext) values(\'' + name + '\',\'' + text + '\');');
			} catch (e) {
				console.log(e);
			}
			ondone();
		});
	} catch (e) {
		console.log(e);
		ondone();
	}
}

function saveString2IndexedDB(name, text, ondone) {
	try {
		doStoreIndexedDB(function (idbObjectStore) {
			saveString2ObjectStore(idbObjectStore, name, text, ondone);
		});
	} catch (e) {
		console.log(e);
		ondone(null);
	}
}

function readStringFromIndexedDB(name, ondone) {
	try {
		doStoreIndexedDB(function (idbObjectStore) {
			readStringFromObjectStore(idbObjectStore, name, ondone);
		});
	} catch (e) {
		console.log(e);
		ondone(null);
	}
}

function getWebDB() {
	var database = window.openDatabase('websql', 1, 'CfgDB', 256 * 1024);
	return database;
}

function doStoreIndexedDB(ondone) {
	try {
		var idbFactory = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
		var idbOpenDBRequest = idbFactory.open('indexedDB', 2);
		idbOpenDBRequest.onupgradeneeded = function (event) {
			//console.log(event);
			var idbDatabase = event.target.result;
			try {
				var idbObjectStore = idbDatabase.createObjectStore('objectStore');
			} catch (e) {
				console.log('objectStore', e);
			}
		}
		idbOpenDBRequest.onerror = function (event) {
			//console.log(event);
			ondone(null);
		};
		idbOpenDBRequest.onsuccess = function (event) {
			var idbDatabase = event.target.result;
			var idbTransaction = idbDatabase.transaction('objectStore', 'readwrite');
			var idbObjectStore = idbTransaction.objectStore('objectStore');
			ondone(idbObjectStore);
		};
	} catch (e) {
		console.log(e);
		ondone(null);
	}
}

function saveString2ObjectStore(idbObjectStore, name, text, ondone) {
	try {
		var idbRequest = idbObjectStore.delete(name);
		idbRequest.onerror = function (event) {
			ondone();
		};
		idbRequest.onsuccess = function (event) {

			try {
				var idbRequest2 = idbObjectStore.add(text, name);
				idbRequest2.onerror = function (event) {
					//console.log(event);
					ondone();
				};
				idbRequest2.onsuccess = function (event) {
					ondone();
				}
			} catch (e) {
				console.log(e);
				ondone();
			}
		};
	} catch (e) {
		console.log(e);
		ondone();
	}
}

function readStringFromObjectStore(idbObjectStore, name, ondone) {
	try {
		var idbRequest = idbObjectStore.get(name);
		idbRequest.onerror = function (event) {
			//console.log(event);
			ondone(null);
		};
		idbRequest.onsuccess = function (event) {
			ondone(idbRequest.result);
		};
	} catch (e) {
		console.log(e);
		ondone(null);
	}
}

////////////////////////////////////
//var disableSave=false;
function saveObject2localStorage(name, o) {
	//console.log(disableSave,'saveObject2localStorage', name, o);
	localStorage.setItem(name, JSON.stringify(o));
}

function readObjectFromlocalStorage(name) {
	var o = null;
	try {
		o = JSON.parse(localStorage.getItem(name));
	} catch (ex) {
		console.log(ex);
		return {};
	}
	return o;
}

function saveText2localStorage(name, text) {
	//console.log('saveText2localStorage', name, text);
	localStorage.setItem(name, text);
}

function readTextFromlocalStorage(name) {
	var o = '';
	try {
		o = localStorage.getItem(name);
	} catch (ex) {
		//console.log(ex);
	}
	return o;
}

function sureArray(v, defaultValue) {
	if (v) {
		if (v.length > 0) {
			return v;
		} else {
			return defaultValue;
		}
	} else {
		return defaultValue;
	}
}

function sureNumeric(v, minValue, defaultValue, maxValue) {
	var r = defaultValue;
	try {
		r = Number.parseFloat(v);
	} catch (ex) {
		console.log(ex);
	}
	if (isNaN(r)) {
		r = defaultValue;
	}
	if (r < minValue) {
		r = minValue;
	}
	if (r > maxValue) {
		r = maxValue;
	}
	return r;
}

function sureInList(v, defaultValue, items) {
	var r = defaultValue;
	for (var i = 0; i < items.length; i++) {
		if (items[i] == v) {
			return v;
		}
	}
	return r;
}

function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
		vars[key] = value;
	});
	return vars;
}

function decodeState(encoded) {
	try {
		//addStateToHistory();
		var strings = encoded.split('-');
		var tempo = parseInt(strings[0], 16);
		//console.log('tempo',tempo);
		//var t=[80, 100, 120, 140, 160, 180, 200, 220, 240];

		//var tempo = 1 * sureInList(readTextFromlocalStorage('tempo'), 120, [80, 100, 120, 140, 160, 180, 200, 220, 240]);
		saveText2localStorage('tempo', '' + tempo);
		for (var i = 0; i < 8; i++) {
			var n = 10 * parseInt(strings[1].substring(i, i + 1), 16);
			//console.log('track'+i,n);
			saveText2localStorage('track' + i, '' + n);
		}
		for (var i = 0; i < 8; i++) {
			var n = 10 * parseInt(strings[2].substring(i, i + 1), 16);
			//console.log('drum'+i,n);
			saveText2localStorage('drum' + i, '' + n);
		}
		//console.log(strings[3]);
		for (var i = 0; i < 10; i++) {
			var t = strings[3].substring(i * 2, i * 2 + 2);
			var n = parseInt(t, 16) - 10;
			//console.log('equalizer'+i,n,t);
			saveText2localStorage('equalizer' + i, '' + n);
		}
		var storeDrums = [];
		var cnt = strings[4].length / 4;
		//console.log(cnt,strings[4]);
		for (var i = 0; i < cnt; i++) {
			var key = parseInt(strings[4].substring(i * 4, i * 4 + 2), 16);
			var data = parseInt(strings[4].substring(i * 4 + 2, i * 4 + 4), 16);
			var drum = key >> 5;
			var i32 = key & parseInt('11111', 2);
			//console.log(pad0(key.toString(2),8),pad0(data.toString(2),8),drum,i32);
			if ((data | parseInt('00000001', 2)) == data)
				storeDrums.push({
					drum: drum,
					beat: i32 * 8 + 0
				}); //console.log('drum',drum,i32*8+0);
			if ((data | parseInt('00000010', 2)) == data)
				storeDrums.push({
					drum: drum,
					beat: i32 * 8 + 1
				}); //console.log('drum',drum,i32*8+1);
			if ((data | parseInt('00000100', 2)) == data)
				storeDrums.push({
					drum: drum,
					beat: i32 * 8 + 2
				}); //console.log('drum',drum,i32*8+2);
			if ((data | parseInt('00001000', 2)) == data)
				storeDrums.push({
					drum: drum,
					beat: i32 * 8 + 3
				}); //console.log('drum',drum,i32*8+3);
			if ((data | parseInt('00010000', 2)) == data)
				storeDrums.push({
					drum: drum,
					beat: i32 * 8 + 4
				}); //console.log('drum',drum,i32*8+4);
			if ((data | parseInt('00100000', 2)) == data)
				storeDrums.push({
					drum: drum,
					beat: i32 * 8 + 5
				}); //console.log('drum',drum,i32*8+5);
			if ((data | parseInt('01000000', 2)) == data)
				storeDrums.push({
					drum: drum,
					beat: i32 * 8 + 6
				}); //console.log('drum',drum,i32*8+6);
			if ((data | parseInt('10000000', 2)) == data)
				storeDrums.push({
					drum: drum,
					beat: i32 * 8 + 7
				}); //console.log('drum',drum,i32*8+7);
		}
		saveObject2localStorage('storeDrums', storeDrums);
		var storeTracks = [];
		cnt = strings[5].length / 9;
		for (var i = 0; i < cnt; i++) {
			var beat = parseInt(strings[5].substring(i * 9, i * 9 + 2), 16);
			var track = parseInt(strings[5].substring(i * 9 + 2, i * 9 + 2 + 1), 16);
			var length = parseInt(strings[5].substring(i * 9 + 3, i * 9 + 3 + 2), 16);
			var pitch = parseInt(strings[5].substring(i * 9 + 5, i * 9 + 5 + 2), 16);
			var shift = parseInt(strings[5].substring(i * 9 + 7, i * 9 + 7 + 2), 16) - 64;
			//console.log(beat,track,length,pitch,shift);
			storeTracks.push({
				track: track,
				beat: beat,
				length: length,
				shift: shift,
				pitch: pitch
			});
		}
		for (var i = 0; i < 8; i++) {
			saveText2localStorage('reDrum' + i, '0');
			saveText2localStorage('reTrack' + i, '0');
		}
		if (strings[6]) {
			for (var i = 0; i < 8; i++) {
				var r = parseInt(strings[6].substring(i * 3, i * 3 + 3), 16);
				//drumInfo[i].replacement=r;
				saveText2localStorage('reDrum' + i, '' + r);
			}
		}
		if (strings[7]) {
			for (var i = 0; i < 8; i++) {
				var r = parseInt(strings[7].substring(i * 3, i * 3 + 3), 16);
				//trackInfo[7-i].replacement=r;
				saveText2localStorage('reTrack' + (7 - i), '' + r);
			}
		}
		saveObject2localStorage('storeTracks', storeTracks);

	} catch (ex) {
		console.log(ex);
	}
	//vvv.rfff();
}

function pad0(value, size) {
	for (var i = value.length; i < size; i++) {
		value = '0' + value;
	}
	return value;
}

function encodeState() {
	var txt = '';
	try {
		var tempo = 1 * sureInList(readTextFromlocalStorage('tempo'), 120, [80, 100, 120, 140, 160, 180, 200, 220, 240]);

		txt = tempo.toString(16);
		//console.log(txt,tempo,readTextFromlocalStorage('tempo'));

		var tracks = '';
		for (var i = 0; i < 8; i++) {
			var n = Math.round(sureNumeric(readTextFromlocalStorage('track' + i), 0, 60, 100) / 10).toString(16);
			tracks = tracks + n;
		}
		txt = txt + '-' + tracks;
		var drums = '';
		for (var i = 0; i < 8; i++) {
			var n = Math.round(sureNumeric(readTextFromlocalStorage('drum' + i), 0, 60, 100) / 10).toString(16);
			drums = drums + n;
		}
		txt = txt + '-' + drums;
		var equalizer = '';
		for (var i = 0; i < 10; i++) {
			var n = pad0(Math.round(sureNumeric(readTextFromlocalStorage('equalizer' + i), -10, 60, 10) + 10).toString(16), 2);
			equalizer = equalizer + n;
		}
		txt = txt + '-' + equalizer;
		var storeDrums = readObjectFromlocalStorage('storeDrums');
		var drumData = "";
		for (var di = 0; di < 8; di++) {
			for (var bi = 0; bi < 32; bi++) {
				var part = [];
				for (var i = 0; i < storeDrums.length; i++) {
					var drum = storeDrums[i].drum;
					var beat = storeDrums[i].beat;
					if (drum == di && beat >= bi * 8 && beat < (bi + 1) * 8) {
						part.push(beat - bi * 8);
					}
				}
				if (part.length > 0) {
					var key = di << 5 | bi;
					var data = 0;
					for (var t = 0; t < part.length; t++) {
						data = data | (1 << part[t]);
					}
					drumData = drumData + pad0(key.toString(16), 2) + pad0(data.toString(16), 2);
				}
			}
		}
		txt = txt + '-' + drumData;
		var storeTracks = readObjectFromlocalStorage('storeTracks');
		var pitchData = '';
		for (var bi = 0; bi < 256; bi++) {
			var data = '';
			for (var i = 0; i < storeTracks.length; i++) {
				var beat = storeTracks[i].beat;
				var length = storeTracks[i].length;
				var pitch = storeTracks[i].pitch;
				var shift = 64 + storeTracks[i].shift;
				var track = storeTracks[i].track;
				if (beat == bi) {
					var nd = pad0(beat.toString(16), 2) + track.toString(16) + pad0(length.toString(16), 2) + pad0(pitch.toString(16), 2) + pad0(shift.toString(16), 2);
					pitchData = pitchData + nd;
					//console.log(beat,track.toString(16),shift,nd);
				}
			}
		}
		txt = txt + '-' + pitchData;
		var drumreplacements = '';
		for (var r = 0; r < 8; r++) {
			drumreplacements = drumreplacements + hex3(sureNumeric(readTextFromlocalStorage('reDrum' + r), 0, 0, 1000));
		}
		txt = txt + '-' + drumreplacements;
		var ireplacements = '';
		for (var r = 0; r < 8; r++) {
			ireplacements = ireplacements + hex3(sureNumeric(readTextFromlocalStorage('reTrack' + (7 - r)), 0, 0, 2000));
		}
		txt = txt + '-' + ireplacements;
	} catch (ex) {
		console.log(ex);
	}
	//console.log(txt);
	return txt;
}

function hex3(n) {
	var nn = 1 * n;
	var s = nn.toString(16);
	if (s.length < 2) {
		return '00' + s;
	}
	if (s.length < 3) {
		return '0' + s;
	}
	return s;
}

function addStateToHistory(nocut) {
	var hstry = sureArray(readObjectFromlocalStorage('history'), []);
	var state = {};
	state.label = '' + new Date();
	state.storeDrums = sureArray(readObjectFromlocalStorage('storeDrums'), []);
	state.storeTracks = sureArray(readObjectFromlocalStorage('storeTracks'), []);

	for (var i = 0; i < 10; i++) {
		state['equalizer' + i] = readTextFromlocalStorage('equalizer' + i);
	}
	for (var i = 0; i < 8; i++) {
		state['drum' + i] = readTextFromlocalStorage('drum' + i);
		state['track' + i] = readTextFromlocalStorage('track' + i);
	}
	state['tempo'] = readTextFromlocalStorage('tempo');
	state['flatstate'] = readObjectFromlocalStorage('flatstate');
	hstry.push(state);
	if (nocut) {
		//
	} else {
		while (hstry.length > 23) {
			hstry.shift();
		}
	}
	saveObject2localStorage('history', hstry);
}

function removeStateFromHistory(n) {
	var hstry = sureArray(readObjectFromlocalStorage('history'), []);
	if (hstry.length > n) {
		var state = hstry[n];
		hstry.splice(n, 1);
		saveObject2localStorage('history', hstry);
		saveObject2localStorage('storeDrums', state.storeDrums);
		saveObject2localStorage('storeTracks', state.storeTracks);
		saveObject2localStorage('flatstate', state.flatstate);
		saveText2localStorage('tempo', state.tempo);
		for (var i = 0; i < 10; i++) {
			saveText2localStorage('equalizer' + i, state['equalizer' + i]);
		}
		for (var i = 0; i < 8; i++) {
			saveText2localStorage('drum' + i, state['drum' + i]);
			saveText2localStorage('track' + i, state['track' + i]);
		}
	}
}

function modeDrumColor(bgMode) {
	if (bgMode == 2) {
		return '#233';
	}
	return '#ccc';
}

function modeDrumShadow(bgMode) {
	if (bgMode == 2) {
		return '#9a9';
	}
	return '#566';
}

function modeNoteName(bgMode) {
	if (bgMode == 0) {
		return '#000';
	}
	return '#fff';
}

function modeBackground(bgMode) {
	if (bgMode == 1) {
		return '#31424C';
	}
	if (bgMode == 2) {
		//return '#C8D1D2';
		return '#eef';
	}
	return '#000609';
}

function midiOnMIDImessage(event) {
	var data = event.data;
	var cmd = data[0] >> 4;
	var channel = data[0] & 0xf;
	var type = data[0] & 0xf0;
	var pitch = data[1];
	var velocity = data[2];
	switch (type) {
		case 144:
			window.riffshareflat.midiNoteOn(pitch);
			break;
		case 128:
			window.riffshareflat.midiNoteOff(pitch);
			break;
	}
}

function midiOnStateChange(event) {
	//console.log('midiOnStateChange', event);
}

function requestMIDIAccessSuccess(midi) {
	var inputs = midi.inputs.values();
	for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
		//console.log('midi input', input);
		input.value.onmidimessage = midiOnMIDImessage;
	}
	midi.onstatechange = midiOnStateChange;
}

function requestMIDIAccessFailure(e) {
	//console.log('requestMIDIAccessFailure', e);
}

function startListenMIDI() {
	if (navigator.requestMIDIAccess) {
		//console.log('navigator.requestMIDIAccess ok');
		navigator.requestMIDIAccess().then(requestMIDIAccessSuccess, requestMIDIAccessFailure);
	} else {
		console.log('navigator.requestMIDIAccess failed', e);
	}
}

function RiffShareFlat() {
	window.riffshareflat = this;
	window.addEventListener("resize", riffshareflat.resetSize.bind(riffshareflat));

	window.addEventListener("pagehide", riffshareflat.saveState.bind(riffshareflat));
	window.addEventListener("blur", riffshareflat.saveState.bind(riffshareflat));
	window.addEventListener("unload", riffshareflat.saveState.bind(riffshareflat));
	
	return this;
}
RiffShareFlat.prototype.init = function () {
	console.log('init');
	this.tapSize = 32;
	try {
		//console.log('window.devicePixelRatio', window.devicePixelRatio);
		var pixelRatio = window.devicePixelRatio;
		this.tapSize = 31 * pixelRatio;
		if (isNaN(this.tapSize)) {
			this.tapSize = 51;
		}
	} catch (ex) {
		console.log(ex);
	}
	//console.log('tapSize', this.tapSize, 'devicePixelRatio', window.devicePixelRatio);
	this.tickID = -1;
	this.onAir = false;
	this.midiKeys = [];
	//this.queueAhead = 0.75;
	this.tickerDelay = 1;
	this.tickerStep = 0;
	//console.log('queueAhead', this.queueAhead);
	this.svgns = "http://www.w3.org/2000/svg";
	this.contentDiv = document.getElementById('contentDiv');
	//console.log('this.contentDiv',this.contentDiv);
	this.contentSVG = document.getElementById('contentSVG');
	this.rakeDiv = document.getElementById('rakeDiv');
	this.contentGroup = document.getElementById('contentGroup');
	//console.log('this.contentGroup',this.contentGroup);
	this.paneGroup = document.getElementById('paneGroup');
	this.linesGroup = document.getElementById('linesGroup');
	this.textGroup = document.getElementById('textGroup');
	this.drumGroup = document.getElementById('drumGroup');
	this.upperGroup = document.getElementById('upperGroup');
	this.counterGroup = document.getElementById('counterGroup');
	this.counterLine = null;
	this.trackGroups = [];
	this.trackGroups[7] = document.getElementById('track1Group');
	this.trackGroups[6] = document.getElementById('track2Group');
	this.trackGroups[5] = document.getElementById('track3Group');
	this.trackGroups[4] = document.getElementById('track4Group');
	this.trackGroups[3] = document.getElementById('track5Group');
	this.trackGroups[2] = document.getElementById('track6Group');
	this.trackGroups[1] = document.getElementById('track7Group');
	this.trackGroups[0] = document.getElementById('track8Group');
	//this.bgGroup = document.getElementById('bgGroup');
	//this.bgImage = document.getElementById('bgImage');
	//this.bgImageWidth = 1280;
	//this.bgImageHeight = 800;
	//this.inChordDelay = 0.01;
	this.sentWhen = 0;
	this.sentMeasure = 0;
	this.nextBeat = 0;
	this.nextWhen = 0;
	this.mark = null;
	this.undoQueue = [];
	this.undoStep = 0;
	this.undoSize = 99;
	this.translateX = 0;
	this.translateY = 0;
	this.translateZ = 4;
	this.innerWidth = 3000;
	this.innerHeight = 2000;
	this.minZoom = 1;
	this.maxZoom = 20;
	this.spots = [];
	this.timeOutID = 0;
	this.marginLeft = 18.5;
	this.marginRight = 17;
	this.marginTop = 1;
	this.marginBottom = 1;
	this.tempo = 120; //sureInList(readTextFromlocalStorage('tempo'), 120, [80, 100, 120, 140, 160, 180, 200, 220]);
	this.bgMode = 0; //sureInList(readTextFromlocalStorage('bgMode'), 0, [0, 1, 2]);
	this.contentDiv.style.background = modeBackground(this.bgMode);
	this.drumVolumes = [70, 70, 70, 70, 70, 70, 70, 70];
	/*for (var i = 0; i < 8; i++) {
	this.drumVolumes.push(sureNumeric(readObjectFromlocalStorage('drum' + i), 0, 70, 100));
	}*/
	this.equalizer = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	/*for (var i = 0; i < 10; i++) {
	this.equalizer.push(sureNumeric(readObjectFromlocalStorage('equalizer' + i), -10, 0, 10));
	}*/
	//this.drumInfo = drumInfo;
	//this.trackInfo = trackInfo;
	//console.log('set 1.25');
	this.drumInfo = [{
		sound: _drum_35_0_Chaos_sf2_file,
		pitch: 36, //36
		title: 'Кик',
		id: 0,
		volumeRatio: 0.95,
		length: 0.3
	}, {
		sound: _drum_41_26_JCLive_sf2_file,
		pitch: 41, //43
		title: 'Большой том',
		id: 1,
		volumeRatio: 0.5,
		length: 0.3
	}, {
		sound: _drum_38_22_FluidR3_GM_sf2_file,
		pitch: 38, //40
		title: 'Рабочий',
		id: 2,
		volumeRatio: 1.0,
		length: 0.3
	}, {
		sound: _drum_45_26_JCLive_sf2_file,
		pitch: 45, //47,48,50
		title: 'Малый том',
		id: 3,
		volumeRatio: 0.75,
		length: 0.3
	}, {
		sound: _drum_42_26_JCLive_sf2_file,
		pitch: 42, //44
		title: 'Закрытый хет',
		id: 4,
		volumeRatio: 0.5,
		length: 0.5
	}, {
		sound: _drum_46_26_JCLive_sf2_file,
		pitch: 46, //
		title: 'Открытый хет',
		id: 5,
		volumeRatio: 0.5,
		length: 0.5
	}, {
		sound: _drum_51_26_JCLive_sf2_file,
		pitch: 51, //rest
		title: 'Райд',
		id: 6,
		volumeRatio: 0.3,
		length: 1
	}, {
		sound: _drum_49_26_JCLive_sf2_file,
		pitch: 49, //
		title: 'Сплеш',
		id: 7,
		volumeRatio: 0.3,
		length: 2
	}];
	this.trackInfo = [{
			color: 'rgb(255,127,77)',
			shadow: 'rgba(255,127,77,0.4)',
			//color: 'rgba(255,204,187,1)',
			//shadow: 'rgba(255,204,187,0.4)',
			title: 'Синтезатор',
			order: 2,
			sound: _tone_0390_GeneralUserGS_sf2_file,
			volume: sureNumeric(readObjectFromlocalStorage('track7'), 0, 70, 100),
			nn: 7,
			octave: 3,
			inChordDelay: 0.01,
			volumeRatio: 0.5
		}, {
			color: 'rgb(178,178,0)',
			shadow: 'rgba(178,178,0,0.4)',
			//color: 'rgba(204,153,0,1)',
			//shadow: 'rgba(204,153,0,0.4)',
			title: 'Струнные',
			order: 1,
			sound: _tone_0490_Chaos_sf2_file,
			volume: sureNumeric(readObjectFromlocalStorage('track6'), 0, 70, 100),
			nn: 6,
			octave: 3,
			inChordDelay: 0,
			volumeRatio: 0.3
		}, {
			color: 'rgb(140,0,64)',
			shadow: 'rgba(140,0,64,0.4)',
			//color: 'rgba(204,0,204,1)',
			//shadow: 'rgba(204,0,204,0.4)',
			title: 'Бас-гитара',
			order: 5,
			sound: _tone_0340_Aspirin_sf2_file,
			volume: sureNumeric(readObjectFromlocalStorage('track5'), 0, 70, 100),
			nn: 5,
			octave: 2,
			inChordDelay: 0.01,
			volumeRatio: 0.75
		}, {
			color: 'rgb(0,127,255)',
			shadow: 'rgba(0,127,255,0.4)',
			//color: 'rgba(00,153,255,1)',
			//shadow: 'rgba(00,153,255,0.4)',
			title: 'Пианино',
			order: 3,
			sound: _tone_0001_FluidR3_GM_sf2_file,
			volume: sureNumeric(readObjectFromlocalStorage('track4'), 0, 70, 100),
			nn: 4,
			octave: 3,
			inChordDelay: 0,
			volumeRatio: 0.5
		}, {
			color: 'rgb(140,35,0)',
			shadow: 'rgba(140,35,0,0.4)',
			//color: 'rgba(153,51,0,1)',
			//shadow: 'rgba(153,51,0,0.4)',
			title: 'Мьют-дисторшн',
			order: 4,
			sound: _tone_0280_LesPaul_sf2_file,
			volume: sureNumeric(readObjectFromlocalStorage('track3'), 0, 70, 100),
			nn: 3,
			octave: 3,
			inChordDelay: 0,
			volumeRatio: 1.0
		}, {
			color: 'rgb(35,51,255)',
			shadow: 'rgba(35,51,255,0.4)',
			//color: 'rgba(51,51,255,1)',
			//shadow: 'rgba(51,51,255,0.4)',
			title: 'Синт. орган',
			order: 0,
			inChordDelay: 0,
			sound: _tone_0170_SBLive_sf2,
			//sound: _tone_0170_JCLive_sf2_file,
			volume: sureNumeric(readObjectFromlocalStorage('track2'), 0, 70, 100),
			nn: 2,
			octave: 4,
			volumeRatio: 0.7
		}, {
			color: 'rgb(45,178,0)',
			shadow: 'rgba(45,178,0,0.4)',
			//color: 'rgba(0,153,0,1)',
			//shadow: 'rgba(0,153,0,0.4)',
			title: 'Аккуст. гитара',
			order: 6,
			sound: _tone_0250_Chaos_sf2_file,
			volume: sureNumeric(readObjectFromlocalStorage('track1'), 0, 70, 100),
			nn: 1,
			octave: 3,
			inChordDelay: 0.01,
			volumeRatio: 0.5
		}, {
			color: 'rgb(255,0,0)',
			shadow: 'rgba(255,0,0,0.4)',
			//color: 'rgba(255,0,0,1)',
			//shadow: 'rgba(255,0,0,0.4)',
			title: 'Гитара-дисторшн',
			order: 7,
			sound: _tone_0300_LesPaul_sf2_file,
			volume: sureNumeric(readObjectFromlocalStorage('track0'), 0, 70, 100),
			nn: 0,
			octave: 3,
			inChordDelay: 0.01,
			volumeRatio: 0.7
		}

	];




	/*
	this.drumInfo = [{
	sound: _drum_35_0_Chaos_sf2_file,
	pitch: 36, //36
	title: 'Bass drum',
	id: 0,
	volumeRatio: 0.5,
	length: 0.5
	}, {
	sound: _drum_41_26_JCLive_sf2_file,
	pitch: 41, //43
	title: 'Low Tom',
	id: 1,
	volumeRatio: 0.5,
	length: 0.5
	}, {
	sound: _drum_38_22_FluidR3_GM_sf2_file,
	pitch: 38, //40
	title: 'Snare drum',
	id: 2,
	volumeRatio: 0.75,
	length: 0.5
	}, {
	sound: _drum_45_26_JCLive_sf2_file,
	pitch: 45, //47,48,50
	title: 'Mid Tom',
	id: 3,
	volumeRatio: 0.75,
	length: 0.5
	}, {
	sound: _drum_42_26_JCLive_sf2_file,
	pitch: 42, //44
	title: 'Closed Hi-hat',
	id: 4,
	volumeRatio: 0.5,
	length: 1
	}, {
	sound: _drum_46_26_JCLive_sf2_file,
	pitch: 46, //
	title: 'Open Hi-hat',
	id: 5,
	volumeRatio: 0.5,
	length: 1
	}, {
	sound: _drum_51_26_JCLive_sf2_file,
	pitch: 51, //rest
	title: 'Ride Cymbal',
	id: 6,
	volumeRatio: 0.3,
	length: 2
	}, {
	sound: _drum_49_26_JCLive_sf2_file,
	pitch: 49, //
	title: 'Splash Cymbal',
	id: 7,
	volumeRatio: 0.3,
	length: 3
	}
	];
	this.trackInfo = [{
	color: 'rgba(255,204,187,1)',
	shadow: 'rgba(255,204,187,0.4)',
	title: 'Synth Bass',
	order: 2,
	sound: _tone_0390_GeneralUserGS_sf2_file,
	volume: sureNumeric(readObjectFromlocalStorage('track7'), 0, 70, 100),
	nn: 7,
	octave: 3,
	volumeRatio: 0.5
	}, {
	color: 'rgba(204,153,0,1)',
	shadow: 'rgba(204,153,0,0.4)',
	title: 'String Ensemble',
	order: 1,
	sound: _tone_0480_Aspirin_sf2_file,
	volume: sureNumeric(readObjectFromlocalStorage('track6'), 0, 70, 100),
	nn: 6,
	octave: 3,
	volumeRatio: 0.6
	}, {
	color: 'rgba(204,0,204,1)',
	shadow: 'rgba(204,0,204,0.4)',
	title: 'Bass guitar',
	order: 5,
	sound: _tone_0330_SoundBlasterOld_sf2,
	volume: sureNumeric(readObjectFromlocalStorage('track5'), 0, 70, 100),
	nn: 5,
	octave: 2,
	volumeRatio: 0.99
	}, {
	color: 'rgba(00,153,255,1)',
	shadow: 'rgba(00,153,255,0.4)',
	title: 'Acoustic Piano',
	order: 3,
	sound: _tone_0000_Chaos_sf2_file,
	volume: sureNumeric(readObjectFromlocalStorage('track4'), 0, 70, 100),
	nn: 4,
	octave: 3,
	volumeRatio: 0.9
	}, {
	color: 'rgba(153,51,0,1)',
	shadow: 'rgba(153,51,0,0.4)',
	title: 'PalmMute guitar',
	order: 4,
	sound: _tone_0280_LesPaul_sf2_file,
	volume: sureNumeric(readObjectFromlocalStorage('track3'), 0, 70, 100),
	nn: 3,
	octave: 3,
	volumeRatio: 0.9
	}, {
	color: 'rgba(51,51,255,1)',
	shadow: 'rgba(51,51,255,0.4)',
	title: 'Percussive Organ',
	order: 0,
	sound: _tone_0170_JCLive_sf2_file,
	volume: sureNumeric(readObjectFromlocalStorage('track2'), 0, 70, 100),
	nn: 2,
	octave: 4,
	volumeRatio: 0.6
	}, {
	color: 'rgba(0,153,0,1)',
	shadow: 'rgba(0,153,0,0.4)',
	title: 'Acoustic guitar',
	order: 6,
	sound: _tone_0250_Chaos_sf2_file,
	volume: sureNumeric(readObjectFromlocalStorage('track1'), 0, 70, 100),
	nn: 1,
	octave: 3,
	volumeRatio: 0.75
	}, {
	color: 'rgba(255,0,0,1)',
	shadow: 'rgba(255,0,0,0.4)',
	title: 'Distortion guitar',
	order: 7,
	sound: _tone_0300_LesPaul_sf2_file,
	volume: sureNumeric(readObjectFromlocalStorage('track0'), 0, 70, 100),
	nn: 0,
	octave: 3,
	volumeRatio: 0.9
	}

	];*/
	this.setupInput();
	/*
	window.onresize = function () {
		riffshareflat.resetSize();
	};
	window.onunload = function () {
		riffshareflat.saveState();
	};
	window.unload = function () {
		riffshareflat.saveState();
	};
	window.onpagehide = function () {
		riffshareflat.saveState();
	};
	window.pagehide = function () {
		riffshareflat.saveState();
	};
	window.onbeforeunload = function () {
		riffshareflat.saveState();
	};
	window.onblur = function () {
		riffshareflat.saveState();
	};
	try{
		var target = window;
		while (target != target.parent) {
			target = target.parent;
			console.log(target);
		}
		target.onblur = function () {
			riffshareflat.saveState();
		};
	}catch(ex){

	}*/
	this.storeDrums = [];
	this.storeTracks = [];
	//this.storeDrums = sureArray(readObjectFromlocalStorage('storeDrums'), []);
	//console.log(this.storeDrums, readObjectFromlocalStorage('storeDrums'));
	/*try {
	var le = this.storeDrums.length;
	} catch (t) {
	console.log(t);
	this.storeDrums = [];
	}*/
	//this.storeTracks = sureArray(readObjectFromlocalStorage('storeTracks'), []);
	//console.log(this.storeTracks, readObjectFromlocalStorage('storeTracks'));
	/*try {
	var le = this.storeTracks.length;
	} catch (t) {
	console.log(t);
	this.storeTracks = [];
	}*/
	var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
	this.audioContext = new AudioContextFunc();
	this.player = new WebAudioFontPlayer();
	//this.player.afterTime = 0.1;
	this.master = new WebAudioFontChannel(this.audioContext);
	this.echoOn = false;
	try {
		var usrAgnt = navigator.userAgent || navigator.vendor || window.opera;
		if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i //
			.test(usrAgnt) //
			||
			/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i //
			.test(usrAgnt.substr(0, 4))) {
			this.echoOn = false;
			document.title = 'Mobile VKMuzOn';
		} else {
			this.echoOn = true;
			document.title = 'Desktop VKMuzOn';
		}
	} catch (noch) {
		console.log(noch);
	}
	//this.echoOn = true;
	if (this.echoOn) {
		//console.log('init WebAudioFontReverberator');
		this.reverberator = new WebAudioFontReverberator(this.audioContext);
		this.reverberator.output.connect(this.audioContext.destination);
		this.master.output.connect(this.reverberator.input);
	} else {
		//console.log('skip WebAudioFontReverberator');
		this.master.output.connect(this.audioContext.destination);
	}
	for (var i = 0; i < 8; i++) {
		this.trackInfo[i].audioNode = this.audioContext.createGain();
		this.trackInfo[i].audioNode.connect(this.master.input);
		this.drumInfo[i].audioNode = this.audioContext.createGain();
		this.drumInfo[i].audioNode.connect(this.master.input);
	}
	for (var i = 0; i < this.drumInfo.length; i++) {
		this.player.adjustPreset(this.audioContext, this.drumInfo[i].sound);
	}
	for (var i = 0; i < this.trackInfo.length; i++) {
		this.player.adjustPreset(this.audioContext, this.trackInfo[i].sound);
	}
	this.resetSize();
	//setInterval(riffshareflat.moveCounter, 100);
	setInterval(riffshareflat.moveBeatCounter, 100);
	this.loadState();

	//console.log('done init');
	//startListenMIDI();
};
RiffShareFlat.prototype.loadState = function () {
	var me = this;
	var check = readTextFromlocalStorage('tempo');
	//console.log('check', check);
	if (check) {
		this.loadStorageState();
		this.resetAllLayersNow();
	} else {
		readStringFromWebDB('fullState', function (text) {
			if (text) {
				me.saveCopyStorageState(text);
				me.resetAllLayersNow();
			} else {
				readStringFromIndexedDB('fullState', function (text) {
					if (text) {
						me.saveCopyStorageState(text);
						me.resetAllLayersNow();
					};
				});
			}
		});
	}
	/*
	readStringFromWebDB('fullState',function(text){
	//console.log('readStringFromWebDB',text);
	});
	readStringFromIndexedDB('fullState',function(text){
	//console.log('readStringFromIndexedDB',text);
	});*/
	//var fullState=
};
RiffShareFlat.prototype.saveCopyStorageState = function (fullState) {
	var o = JSON.parse(fullState);
	saveObject2localStorage('flatstate', o.flatstate);
	saveText2localStorage('tempo', '' + o.tempo);
	for (var i = 0; i < 8; i++) {
		saveText2localStorage('drum' + i, o['drum' + i]);
		saveText2localStorage('track' + i, o['track' + i]);
	}
	for (var i = 0; i < 10; i++) {
		saveText2localStorage('equalizer' + i, o['equalizer' + i]);
	}
	saveObject2localStorage('storeDrums', o.storeDrums);
	saveObject2localStorage('storeTracks', o.storeTracks);
	this.loadStorageState();
};
RiffShareFlat.prototype.loadStorageState = function () {
	//console.log('loadStorageState');
	this.tempo = sureInList(readTextFromlocalStorage('tempo'), 120, [80, 100, 120, 140, 160, 180, 200, 220, 240]);
	this.bgMode = 1 * sureInList(readTextFromlocalStorage('bgMode'), 0, [0, 1, 2]);
	//console.log('bgMode', this.bgMode);
	this.storeDrums = sureArray(readObjectFromlocalStorage('storeDrums'), []);
	this.storeTracks = sureArray(readObjectFromlocalStorage('storeTracks'), []);
	this.drumVolumes = [];
	for (var i = 0; i < 8; i++) {
		this.drumVolumes.push(sureNumeric(readObjectFromlocalStorage('drum' + i), 0, 70, 100));
		this.drumInfo[i].replacement = sureNumeric(readObjectFromlocalStorage('reDrum' + i), 0, 0, 1000);
		if (this.drumInfo[i].replacement) {
			var info = this.player.loader.drumInfo(this.drumInfo[i].replacement - 1);
			this.player.loader.startLoad(this.audioContext, info.url, info.variable);
			this.drumInfo[i].info = info;
		}
		this.trackInfo[7 - i].replacement = sureNumeric(readObjectFromlocalStorage('reTrack' + i), 0, 0, 2000);
		if (this.trackInfo[7 - i].replacement) {
			var info = this.player.loader.instrumentInfo(this.trackInfo[7 - i].replacement - 1);
			this.player.loader.startLoad(this.audioContext, info.url, info.variable);
			this.trackInfo[7 - i].info = info;
		}
	}
	//console.log(this.trackInfo, this.drumInfo);
	this.equalizer = [];
	for (var i = 0; i < 10; i++) {
		this.equalizer.push(sureNumeric(readObjectFromlocalStorage('equalizer' + i), -10, 0, 10));
	}
	var flatstate = readObjectFromlocalStorage('flatstate');

	//console.log(flatstate);
	if (flatstate) {
		try {
			/*if(flatstate.svcntr){
			this.svcntr=flatstate.svcntr;
			}else{
			this.svcntr=0;
			}
			this.svcntr++;*/
			if (flatstate.tx) {
				this.translateX = flatstate.tx;
			}
			if (flatstate.ty) {
				this.translateY = flatstate.ty;
			}
			if (flatstate.tz) {
				this.translateZ = flatstate.tz;
			}
			if (flatstate.orders) {
				for (var i = 0; i < 8; i++) {
					var o = sureNumeric(flatstate.orders[i], 0, i, 7);
					riffshareflat.trackInfo[i].order = o;
				}
				flatstate.orders.sort();
				for (var i = 0; i < 8; i++) {
					if (flatstate.orders[i] == i) {
						//
					} else {
						for (var n = 0; n < 8; n++) {
							riffshareflat.trackInfo[n].order = riffshareflat.trackInfo[n].nn;
						}
						break;
					}
				}
			}
		} catch (ex) {
			console.log(ex);
		}
	}
	this.setModeBackground(this.bgMode);
	this.resetAllLayersNow();
};
RiffShareFlat.prototype.saveState = function () {
	if (this.player) {
		console.log('saveState');
	}else{
		console.log('skip saveState');
		return;
	}
	
	this.stopPlay();
	this.saveNotesPosition();
};
RiffShareFlat.prototype.saveNotesPosition = function () {

	console.log('saveNotesPosition');
	
	var fullState = {};
	var flatstate = {
		tx: this.translateX,
		ty: this.translateY,
		tz: this.translateZ,
		orders: []
	};
	//this.svcntr++;
	//flatstate.svcntr=this.svcntr;
	for (var i = 0; i < 8; i++) {
		flatstate.orders.push(this.trackInfo[i].order);
	}
	saveObject2localStorage('flatstate', flatstate);
	fullState.flatstate = flatstate;
	saveText2localStorage('tempo', '' + this.tempo);
	fullState.tempo = this.tempo;
	for (var i = 0; i < 8; i++) {
		saveText2localStorage('drum' + i, '' + this.drumVolumes[i]);
		saveText2localStorage('track' + i, '' + this.trackInfo[7 - i].volume);
		fullState['drum' + i] = '' + this.drumVolumes[i];
		fullState['track' + i] = '' + this.trackInfo[7 - i].volume;
		saveText2localStorage('reDrum' + i, '' + this.drumInfo[i].replacement);
		saveText2localStorage('reTrack' + i, '' + this.trackInfo[7 - i].replacement);
	}
	for (var i = 0; i < 10; i++) {
		saveText2localStorage('equalizer' + i, '' + this.equalizer[i]);
		fullState['equalizer' + i] = '' + this.equalizer[i];
	}
	saveObject2localStorage('storeDrums', this.storeDrums);
	fullState.storeDrums = this.storeDrums;
	saveObject2localStorage('storeTracks', this.storeTracks);
	fullState.storeTracks = this.storeTracks;
	//console.log('start copy ----------------------------------------------------------------');

	saveString2WebDB('fullState', JSON.stringify(fullState), function () {
		//console.log('done saveString2WebDB');
	});
	saveString2IndexedDB('fullState', JSON.stringify(fullState), function () {
		//console.log('done saveString2IndexedDB');
	});
	//window.onunload = null;
};
RiffShareFlat.prototype.copyDrums = function () {
	var drums = [];
	for (var i = 0; i < this.storeDrums.length; i++) {
		drums.push({
			beat: this.storeDrums[i].beat,
			drum: this.storeDrums[i].drum
		});
	}
	return drums;
};
RiffShareFlat.prototype.copyTones = function () {
	//console.log(this.storeTracks);
	var tones = [];
	for (var i = 0; i < this.storeTracks.length; i++) {
		tones.push({
			beat: this.storeTracks[i].beat,
			pitch: this.storeTracks[i].pitch,
			track: this.storeTracks[i].track,
			shift: this.storeTracks[i].shift,
			length: this.storeTracks[i].length
		});
	}
	return tones;
};
RiffShareFlat.prototype.setupInput = function () {
	this.startMouseScreenX = 0;
	this.startMouseScreenY = 0;
	this.clickX = 0;
	this.clickY = 0;
	this.twoZoom = false;
	this.twodistance = 0;
	this.twocenter = {
		x: 0,
		y: 0
	};
	this.rakeDiv.addEventListener('mousedown', this.rakeMouseDown, false);
	this.rakeDiv.addEventListener("mousewheel", this.rakeMouseWheel, false);
	this.rakeDiv.addEventListener("DOMMouseScroll", this.rakeMouseWheel, false);
	this.rakeDiv.addEventListener("touchstart", this.rakeTouchStart, false);
	this.rakeDiv.addEventListener("touchmove", this.rakeTouchMove, false);
	this.rakeDiv.addEventListener("touchend", this.rakeTouchEnd, false);
	//console.log('done setupInput');
};
RiffShareFlat.prototype.rakeMouseWheel = function (e) {
	e.preventDefault();
	var e = window.event || e;
	var wheelVal = e.wheelDelta || -e.detail;
	var min = Math.min(1, wheelVal);
	var delta = Math.max(-1, min);
	var zoom = riffshareflat.translateZ + delta * (riffshareflat.translateZ) * 0.077;
	if (zoom < riffshareflat.minZoom) {
		zoom = riffshareflat.minZoom;
	}
	if (zoom > riffshareflat.maxZoom) {
		zoom = riffshareflat.maxZoom;
	}
	riffshareflat.translateX = riffshareflat.translateX - (riffshareflat.translateZ - zoom) * e.layerX;
	riffshareflat.translateY = riffshareflat.translateY - (riffshareflat.translateZ - zoom) * e.layerY;
	riffshareflat.translateZ = zoom;
	riffshareflat.adjustContentPosition();
	riffshareflat.queueTiles();
	return false;
};
RiffShareFlat.prototype.rakeMouseDown = function (mouseEvent) {
	mouseEvent.preventDefault();
	riffshareflat.rakeDiv.addEventListener('mousemove', riffshareflat.rakeMouseMove, true);
	window.addEventListener('mouseup', riffshareflat.rakeMouseUp, false);
	riffshareflat.startMouseScreenX = mouseEvent.clientX;
	riffshareflat.startMouseScreenY = mouseEvent.clientY;
	riffshareflat.clickX = riffshareflat.startMouseScreenX;
	riffshareflat.clickY = riffshareflat.startMouseScreenY;
};
RiffShareFlat.prototype.rakeMouseMove = function (mouseEvent) {
	mouseEvent.preventDefault();
	var dX = mouseEvent.clientX - riffshareflat.startMouseScreenX;
	var dY = mouseEvent.clientY - riffshareflat.startMouseScreenY;
	riffshareflat.translateX = riffshareflat.translateX + dX * riffshareflat.translateZ;
	riffshareflat.translateY = riffshareflat.translateY + dY * riffshareflat.translateZ;
	riffshareflat.startMouseScreenX = mouseEvent.clientX;
	riffshareflat.startMouseScreenY = mouseEvent.clientY;
	riffshareflat.moveZoom();
};
RiffShareFlat.prototype.rakeMouseUp = function (mouseEvent) {
	mouseEvent.preventDefault();
	riffshareflat.rakeDiv.removeEventListener('mousemove', riffshareflat.rakeMouseMove, true);
	if (Math.abs(riffshareflat.clickX - mouseEvent.clientX) < riffshareflat.translateZ * riffshareflat.tapSize / 8 //
		&&
		Math.abs(riffshareflat.clickY - mouseEvent.clientY) < riffshareflat.translateZ * riffshareflat.tapSize / 8) {
		riffshareflat.click();
	}
	riffshareflat.adjustContentPosition();
	riffshareflat.queueTiles();
};
RiffShareFlat.prototype.startTouchZoom = function (touchEvent) {
	riffshareflat.twoZoom = true;
	var p1 = riffshareflat.vectorFromTouch(touchEvent.touches[0]);
	var p2 = riffshareflat.vectorFromTouch(touchEvent.touches[1]);
	riffshareflat.twocenter = riffshareflat.vectorFindCenter(p1, p2);
	var d = riffshareflat.vectorDistance(p1, p2);
	if (d <= 0) {
		d = 1;
	}
	riffshareflat.twodistance = d;
};
RiffShareFlat.prototype.rakeTouchStart = function (touchEvent) {
	touchEvent.preventDefault();
	riffshareflat.startedTouch = true;
	if (touchEvent.touches.length < 2) {
		riffshareflat.twoZoom = false;
		riffshareflat.startMouseScreenX = touchEvent.touches[0].clientX;
		riffshareflat.startMouseScreenY = touchEvent.touches[0].clientY;
		riffshareflat.clickX = riffshareflat.startMouseScreenX;
		riffshareflat.clickY = riffshareflat.startMouseScreenY;
		riffshareflat.twodistance = 0;
		return;
	} else {
		riffshareflat.startTouchZoom(touchEvent);
	}
};
RiffShareFlat.prototype.rakeTouchMove = function (touchEvent) {
	touchEvent.preventDefault();
	if (touchEvent.touches.length < 2) {
		if (riffshareflat.twoZoom) {
			//
		} else {
			var dX = touchEvent.touches[0].clientX - riffshareflat.startMouseScreenX;
			var dY = touchEvent.touches[0].clientY - riffshareflat.startMouseScreenY;
			riffshareflat.translateX = riffshareflat.translateX + dX * riffshareflat.translateZ;
			riffshareflat.translateY = riffshareflat.translateY + dY * riffshareflat.translateZ;
			riffshareflat.startMouseScreenX = touchEvent.touches[0].clientX;
			riffshareflat.startMouseScreenY = touchEvent.touches[0].clientY;
			riffshareflat.moveZoom();
			return;
		}
	} else {
		if (!riffshareflat.twoZoom) {
			riffshareflat.startTouchZoom(touchEvent);
		} else {
			var p1 = riffshareflat.vectorFromTouch(touchEvent.touches[0]);
			var p2 = riffshareflat.vectorFromTouch(touchEvent.touches[1]);
			var d = riffshareflat.vectorDistance(p1, p2);
			if (d <= 0) {
				d = 1;
			}
			var ratio = d / riffshareflat.twodistance;
			riffshareflat.twodistance = d;
			var zoom = riffshareflat.translateZ / ratio;
			if (zoom < riffshareflat.minZoom) {
				zoom = riffshareflat.minZoom;
			}
			if (zoom > riffshareflat.maxZoom) {
				zoom = riffshareflat.maxZoom;
			}
			riffshareflat.translateX = riffshareflat.translateX - (riffshareflat.translateZ - zoom) * riffshareflat.twocenter.x;
			riffshareflat.translateY = riffshareflat.translateY - (riffshareflat.translateZ - zoom) * riffshareflat.twocenter.y;
			riffshareflat.translateZ = zoom;
			riffshareflat.adjustContentPosition();
		}
	}
};

RiffShareFlat.prototype.rakeTouchEnd = function (touchEvent) {
	touchEvent.preventDefault();
	riffshareflat.queueTiles();
	if (!riffshareflat.twoZoom) {
		if (touchEvent.touches.length < 2) {
			if (riffshareflat.startedTouch) {
				if (Math.abs(riffshareflat.clickX - riffshareflat.startMouseScreenX) < riffshareflat.translateZ * riffshareflat.tapSize / 8 //
					&&
					Math.abs(riffshareflat.clickY - riffshareflat.startMouseScreenY) < riffshareflat.translateZ * riffshareflat.tapSize / 8) {
					riffshareflat.click();
				}
			} else {
				//console.log('touch ended already');
			}
			riffshareflat.adjustContentPosition();
			return;
		}
	}
	riffshareflat.twoZoom = false;
	riffshareflat.startedTouch = false;
	riffshareflat.adjustContentPosition();
};
RiffShareFlat.prototype.click = function () {
	var xy = this.unzoom(this.clickX, this.clickY, this.translateZ);
	this.clickContentX = xy.x;
	this.clickContentY = xy.y;
	this.runSpots(this.clickContentX, this.clickContentY);
};
RiffShareFlat.prototype.vectorDistance = function (xy1, xy2) {
	var xy = this.vectorSubstract(xy1, xy2);
	var n = this.vectorNorm(xy);
	return n;
};
RiffShareFlat.prototype.vectorSubstract = function (xy1, xy2) {
	return {
		x: xy1.x - xy2.x,
		y: xy1.y - xy2.y
	};
};
RiffShareFlat.prototype.vectorNorm = function (xy) {
	return Math.sqrt(this.vectorNormSquared(xy));
};
RiffShareFlat.prototype.vectorNormSquared = function (xy) {
	return xy.x * xy.x + xy.y * xy.y;
};
RiffShareFlat.prototype.vectorFromTouch = function (touch) {
	return {
		x: touch.clientX,
		y: touch.clientY
	};
};
RiffShareFlat.prototype.vectorFindCenter = function (xy1, xy2) {
	var xy = this.vectorAdd(xy1, xy2);
	return this.vectorScale(xy, 0.5);
};
RiffShareFlat.prototype.vectorAdd = function (xy1, xy2) {
	return {
		x: xy1.x + xy2.x,
		y: xy1.y + xy2.y
	};
};
RiffShareFlat.prototype.vectorScale = function (xy, coef) {
	return {
		x: xy.x * coef,
		y: xy.y * coef
	};
};
RiffShareFlat.prototype.unzoom = function (x, y, z) {
	var xy = {
		x: x * z - this.translateX,
		y: y * z - this.translateY
	};
	if (this.contentDiv.clientWidth * z > this.innerWidth) {
		xy.x = x * z - ((this.contentDiv.clientWidth * z - this.innerWidth) / 2);
	}
	if (this.contentDiv.clientHeight * z > this.innerHeight) {
		xy.y = y * z - ((this.contentDiv.clientHeight * z - this.innerHeight) / 2);
	}
	xy.x = Math.round(xy.x);
	xy.y = Math.round(xy.y);
	return xy;
};
RiffShareFlat.prototype.addSpot = function (id, x, y, w, h, a, stickX, toZoom) {
	this.dropSpot(id);
	var spot = {
		id: id,
		x: x,
		y: y,
		w: w,
		h: h,
		a: a,
		sx: stickX,
		tz: toZoom
	};
	this.spots.push(spot);
	return spot;
};
RiffShareFlat.prototype.runSpots = function (x, y) {
	var needRedraw = false;
	for (var i = this.spots.length - 1; i >= 0; i--) {
		var spot = this.spots[i];
		var checkX = spot.x;
		var checkY = spot.y;
		if (spot.sx) {
			checkX = spot.x + this.stickedX;
		}
		if (this.collision(x, y, 1, 1, checkX, checkY, spot.w, spot.h)) {
			if (spot.a) {
				spot.a();
			}
			if (spot.tz < this.translateZ && spot.tz > 0) {
				var tox = -checkX;
				if (spot.sx) {
					if (-tox > spot.x) {
						tox = this.translateX;
					} else {
						tox = -spot.x;
					}
				}
				this.startSlideTo(tox, -checkY, spot.tz);
			} else {
				needRedraw = true;
			}
			break;
		}
	}
	if (needRedraw) {
		this.resetAllLayersNow();
	}
};
RiffShareFlat.prototype.startSlideTo = function (x, y, z) {
	var stepCount = 20;
	var dx = (x - this.translateX) / stepCount;
	var dy = (y - this.translateY) / stepCount;
	var dz = (z - this.translateZ) / stepCount;
	var xyz = [];
	for (var i = 0; i < stepCount; i++) {
		xyz.push({
			x: this.translateX + dx * i,
			y: this.translateY + dy * i,
			z: this.translateZ + dz * i
		});
	}
	xyz.push({
		x: x,
		y: y,
		z: z
	});
	this.stepSlideTo(xyz);
};
RiffShareFlat.prototype.stepSlideTo = function (xyz) {
	var n = xyz.shift();
	if (n) {
		this.translateX = n.x;
		this.translateY = n.y;
		this.translateZ = n.z;
		this.adjustContentPosition();
		setTimeout(function () {
			riffshareflat.stepSlideTo(xyz);
		}, 20);
	} else {
		this.resetAllLayersNow();
	}
};
RiffShareFlat.prototype.adjustContentPosition = function () {
	if (this.contentDiv.clientWidth * this.translateZ < this.innerWidth) {
		if (this.translateX < this.contentDiv.clientWidth * this.translateZ - this.innerWidth) {
			this.translateX = this.contentDiv.clientWidth * this.translateZ - this.innerWidth;
		}
		if (this.translateX > 0) {
			this.translateX = 0;
		}
	} else {
		this.translateX = (this.contentDiv.clientWidth * this.translateZ - this.innerWidth) / 2;
	}
	if (this.contentDiv.clientHeight * this.translateZ < this.innerHeight) {
		if (this.translateY < this.contentDiv.clientHeight * this.translateZ - this.innerHeight) {
			this.translateY = this.contentDiv.clientHeight * this.translateZ - this.innerHeight;
		}
		if (this.translateY > 0) {
			this.translateY = 0;
		}
	} else {
		this.translateY = (this.contentDiv.clientHeight * this.translateZ - this.innerHeight) / 2;
	}
	this.moveZoom();
};
RiffShareFlat.prototype.moveZoom = function () {
	var x = -this.translateX;
	var y = -this.translateY;
	var w = this.contentDiv.clientWidth * this.translateZ;
	var h = this.contentDiv.clientHeight * this.translateZ;
	if (w > 1) {
		//
	} else {
		w = 1;
	}
	if (h > 1) {
		//
	} else {
		h = 1;
	}
	this.contentSVG.setAttribute("viewBox", "" + x + " " + y + " " + w + " " + h + "");
	this.reLayoutVertical();
	//this.reLayoutBackGroundImge();
};
RiffShareFlat.prototype.reLayoutVertical = function () {
	var leftTopX = 0;
	var leftTopY = 0;
	var rightBottomX = this.contentDiv.clientWidth;
	var rightBottomY = this.contentDiv.clientHeight;
	if (this.contentDiv.clientWidth * this.translateZ > this.innerWidth) {
		leftTopX = (this.contentDiv.clientWidth - this.innerWidth / this.translateZ) / 2;
		rightBottomX = this.contentDiv.clientWidth - leftTopX;
	}
	if (this.contentDiv.clientHeight * this.translateZ > this.innerHeight) {
		leftTopY = (this.contentDiv.clientHeight - this.innerHeight / this.translateZ) / 2;
		rightBottomY = this.contentDiv.clientHeight - leftTopY;
	}
	var lt = this.unzoom(leftTopX, leftTopY, this.translateZ);
	var xx = lt.x;

	var x = this.marginLeft * this.tapSize;
	var h = this.heightTrTitle * this.tapSize;
	var dx = 45 * this.tapSize + x + h / 2;
	var dx = x;
	var shift = xx - dx;
	if (xx < dx) {
		shift = 0;
	}
	this.stickedX = shift;
};
RiffShareFlat.prototype.__reLayoutBackGroundImge = function () {
	//var zdiff=this.maxZoom-this.minZoom;

	var rw = this.contentDiv.clientWidth / this.bgImageWidth;
	var rh = this.contentDiv.clientHeight / this.bgImageHeight;

	var rz = rw;
	if (rw < rh) {
		rz = rh;
	}
	//3-1
	//20-
	var r = (1 + 0.5 * (this.maxZoom - this.translateZ) / (this.maxZoom - this.minZoom));
	rz = rz * r;
	x = -this.translateX / r;
	if (this.translateX > 0) {
		x = -this.translateX;
	}
	y = -this.translateY / r;
	if (this.translateY > 0) {
		y = -this.translateY;
	}
	var z = rz * this.translateZ;
	//console.log(-this.translateX, x);
	var transformAttr = ' translate(' + x + ',' + y + ') scale(' + z + ')';
	this.bgImage.setAttribute('transform', transformAttr);
}
RiffShareFlat.prototype._reLayoutBackGroundImge = function () {
	var rz = 1;

	var w = this.innerWidth;
	var h = this.innerHeight;

	//var rw =
	//console.log(w, this.bgImageWidth * this.translateZ);

	var maxTranslX = w - this.contentDiv.clientWidth * this.translateZ;
	var maxTranslY = h - this.contentDiv.clientHeight * this.translateZ;
	var maxImgX = w - this.bgImageWidth * rz * this.translateZ;
	var maxImgY = h - this.bgImageHeight * rz * this.translateZ;
	var x = x = -maxImgX * this.translateX / maxTranslX;
	var y = y = -maxImgY * this.translateY / maxTranslY;
	if (maxTranslX == 0) {
		x = 0;
	}
	if (maxTranslY == 0) {
		y = 0;
	}
	x = -this.translateX;
	y = -this.translateY;
	/*
	if (w < this.contentDiv.clientWidth * this.translateZ) {
	x = -this.translateX;
	} else {
	if (this.translateX > 0) {
	x = -this.translateX;
	} else {
	if (-this.translateX > maxTranslX) {
	x = maxImgX - maxTranslX - this.translateX;
	}
	}
	}
	if (h < this.contentDiv.clientHeight * this.translateZ) {
	y = -this.translateY;
	} else {
	if (this.translateY > 0) {
	y = -this.translateY;
	} else {
	if (-this.translateY > maxTranslY) {
	y = maxImgY - maxTranslY - this.translateY;
	}
	}
	}*/
	var z = rz * this.translateZ;
	var transformAttr = ' translate(' + x + ',' + y + ') scale(' + z * rz + ')';
	//console.log(transformAttr);
	this.bgImage.setAttribute('transform', transformAttr);
};
RiffShareFlat.prototype.resetAllLayersNow = function () {
	this.clearLayerChildren([this.contentGroup]);
	this.clearSpots();
	this.resetSize();
	this.resetTiles();
};
RiffShareFlat.prototype.queueTiles = function () {
	//console.log('queueTiles', this.timeOutID);
	if (this.timeOutID > 0) {
		return;
	}
	this.timeOutID = setTimeout(function () {
		riffshareflat.timeOutID = 0;
		riffshareflat.resetTiles();
	}, 100);
};
RiffShareFlat.prototype.resetTiles = function () {
	var leftTopX = 0;
	var leftTopY = 0;
	var rightBottomX = this.contentDiv.clientWidth;
	var rightBottomY = this.contentDiv.clientHeight;
	if (this.contentDiv.clientWidth * this.translateZ > this.innerWidth) {
		leftTopX = (this.contentDiv.clientWidth - this.innerWidth / this.translateZ) / 2;
		rightBottomX = this.contentDiv.clientWidth - leftTopX;
	}
	if (this.contentDiv.clientHeight * this.translateZ > this.innerHeight) {
		leftTopY = (this.contentDiv.clientHeight - this.innerHeight / this.translateZ) / 2;
		rightBottomY = this.contentDiv.clientHeight - leftTopY;
	}
	var lt = this.unzoom(leftTopX, leftTopY, this.translateZ);
	var rb = this.unzoom(rightBottomX, rightBottomY, this.translateZ);
	var xx = lt.x;
	var yy = lt.y;
	var ww = rb.x - lt.x;
	var hh = rb.y - lt.y;
	//console.log(xx, yy, ww, hh);
	this.addContent(xx, yy, ww, hh);
	this.reLayoutVertical();
};
RiffShareFlat.prototype.addContent = function (x, y, w, h) {
	//this.clearLayers([this.gridLayer]);
	//this.clearSpots();
	this.clearUselessDetails(x, y, w, h, this.contentGroup);
	this.addSmallTiles(x, y, w, h);
};
RiffShareFlat.prototype.startPlay = function () {

	if (this.onAir) {
		//console.log('on air already');
		return;
	}
	//console.log('startPlay');
	if (this.audioContext.state == 'suspended') {
		//console.log('audioContext.resume');
		this.audioContext.resume();
	}
	//var N = 4 * 60 / this.tempo;
	//var beatLen = 1 / 16 * N;
	//this.queueAhead=beatLen;
	//console.log('queueAhead', this.queueAhead);
	//console.log(this.trackInfo);
	//console.log(this.drumInfo);
	this.onAir = true;
	this.resetNodeValues();
	/*var N = 4 * 60 / this.tempo;
	var beatLen = 1 / 16 * N;
	var pieceLen = this.cauntMeasures() * N;
	var when=this.audioContext.currentTime;
	this.sendNextPiece(when);
	this.queueNextPiece(pieceLen/2,when+pieceLen);*/
	//this.tickID = 0;
	//this.queueNextPiece(this.audioContext.currentTime, 0);
	this.nextBeat = 0;
	this.nextWhen = 0;
	this.queueNextBeats();
	//this.tickID
	//this.onAir
};
//sendNextBeats
RiffShareFlat.prototype.queueNextBeats = function () {
	//console.log('queueNextBeats', this.nextWhen,this.audioContext.currentTime);
	if (this.onAir) {
		var beat16duration = (4 * 60 / this.tempo) / 16;
		var pieceLen16 = 16 * riffshareflat.cauntMeasures();
		var t = this.audioContext.currentTime;
		if (this.nextWhen < t) {
			this.nextWhen = t;
		}
		//while (this.sentWhen < t + this.queueAhead) {
		while (this.sentWhen < t + beat16duration) {
			this.sendNextBeats(this.nextWhen, this.nextBeat, this.nextBeat);
			this.nextWhen = this.sentWhen + beat16duration;
			this.nextBeat = this.nextBeat + 1;
			if (this.nextBeat >= pieceLen16) {
				this.nextBeat = 0;
			}
		}
		//console.log('	envelopes', this.player.envelopes.length);
		var wait = 0.5 * 1000 * (this.nextWhen - t); //this.audioContext.currentTime);
		//if (this.echoOn) {
		this.tickerStep++;
		if (this.tickerStep >= this.tickerDelay) {
			this.moveBeatCounter();
			this.tickerStep = 0;
		}
		//}
		this.tickID = setTimeout(function () {
			riffshareflat.queueNextBeats();
		}, wait);
	}
}
RiffShareFlat.prototype.moveBeatCounter = function () {
	if (this.onAir) {
		if (this.counterLine) {
			//console.log('moveBeatCounter');
			var N = 4 * 60 / this.tempo;
			var beatLen = 1 / 16 * N;
			var c16 = 16 * this.cauntMeasures();
			var diff = this.nextBeat + (this.audioContext.currentTime - this.nextWhen) / beatLen;
			while (diff < 0) {
				diff = diff + c16;
			}
			var x = diff * this.tapSize;
			var transformAttr = ' translate(' + x + ',0)';
			this.counterLine.setAttribute('transform', transformAttr);
		}
	}
};

RiffShareFlat.prototype.stopPlay = function () {
	this.onAir = false;
	
	if (this.player) {
		clearTimeout(this.tickID);
		this.player.cancelQueue(this.audioContext);
		this.resetAllLayersNow();
	}
};
RiffShareFlat.prototype.resetNodeValues = function () {
	for (var i = 0; i < 8; i++) {
		this.trackInfo[i].audioNode.gain.setValueAtTime(this.trackInfo[i].volume / 100, 0);
		this.drumInfo[i].audioNode.gain.setValueAtTime(this.drumVolumes[i] / 100, 0);
	}
	this.master.band32.gain.setValueAtTime(this.equalizer[0], 0);
	this.master.band64.gain.setValueAtTime(this.equalizer[1], 0);
	this.master.band128.gain.setValueAtTime(this.equalizer[2], 0);
	this.master.band256.gain.setValueAtTime(this.equalizer[3], 0);
	this.master.band512.gain.setValueAtTime(this.equalizer[4], 0);
	this.master.band1k.gain.setValueAtTime(this.equalizer[5], 0);
	this.master.band2k.gain.setValueAtTime(this.equalizer[6], 0);
	this.master.band4k.gain.setValueAtTime(this.equalizer[7], 0);
	this.master.band8k.gain.setValueAtTime(this.equalizer[8], 0);
	this.master.band16k.gain.setValueAtTime(this.equalizer[9], 0);
	//this.master.output.gain.value = 0.1;
};
RiffShareFlat.prototype.cauntMeasures = function () {
	var mx = 0;
	for (var i = 0; i < this.storeDrums.length; i++) {
		if (mx < this.storeDrums[i].beat) {
			mx = this.storeDrums[i].beat;
		}
	}
	for (var i = 0; i < this.storeTracks.length; i++) {
		if (mx < this.storeTracks[i].beat) {
			mx = this.storeTracks[i].beat;
		}
	}
	var le = Math.ceil((mx + 1) / 16);
	if (le > 16) {
		le = 16;
	}
	return le;
}
RiffShareFlat.prototype.cauntDrumMeasures = function () {
	var mx = 0;
	for (var i = 0; i < this.storeDrums.length; i++) {
		if (mx < this.storeDrums[i].beat) {
			mx = this.storeDrums[i].beat;
		}
	}
	var le = Math.ceil((mx + 1) / 16);
	if (le > 16) {
		le = 16;
	}
	return le;
}
RiffShareFlat.prototype.cauntToneMeasures = function (nn) {
	var mx = 0;
	for (var i = 0; i < this.storeTracks.length; i++) {
		if (mx < this.storeTracks[i].beat && nn == this.storeTracks[i].track) {
			mx = this.storeTracks[i].beat;
		}
	}
	var le = Math.ceil((mx + 1) / 16);
	if (le > 16) {
		le = 16;
	}
	return le;
}
RiffShareFlat.prototype.sendNextBeats = function (when, startBeat, endBeat) {
	//console.log('sendNextBeats',  startBeat,'at',when,'count', this.player.envelopes.length);
	this.sentWhen = when;
	this.sentBeat = startBeat;
	var N = 4 * 60 / this.tempo;
	var beatLen = 1 / 16 * N;
	for (var i = 0; i < this.storeDrums.length; i++) {
		var hit = this.storeDrums[i];
		if (hit.beat >= startBeat && hit.beat <= endBeat) {
			var channel = this.drumInfo[hit.drum];
			var zones = channel.sound;
			if (channel.info && window[channel.info.variable]) {
				zones = window[channel.info.variable];
				//console.log(channel.sound,channel.info,channel.info.variable,zones);
			}
			var r = 1.0 - Math.random() * 0.2;
			//this.player.queueWaveTable(this.audioContext, channel.audioNode, channel.sound, when + beatLen * (hit.beat - startBeat), channel.pitch, channel.length, r * channel.volumeRatio);
			this.player.queueWaveTable(this.audioContext, channel.audioNode, zones, when + beatLen * (hit.beat - startBeat), channel.pitch, channel.length, r * channel.volumeRatio);
		}
	}
	var notes = [];
	for (var i = 0; i < this.storeTracks.length; i++) {
		var note = this.storeTracks[i];
		if (note.beat >= startBeat && note.beat <= endBeat) {
			notes.push(note);
		}
	}
	notes.sort(function (n1, n2) {
		var r = 1000 * (n1.beat - n2.beat) + 100000 * (n1.track - n2.track);
		if (n1.beat == n2.beat) {
			r = r + (n1.pitch - n2.pitch);
		}
		return r;
	});
	var currentBeat = -1;
	var currentTrack = -1;
	var inChordCount = 0;
	for (var i = 0; i < notes.length; i++) {
		var note = notes[i];
		if (note.beat != currentBeat || note.track != currentTrack) {
			currentBeat = note.beat;
			currentTrack = note.track;
			inChordCount = 0;
		}
		var channel = this.trackInfo[7 - note.track];
		var zones = channel.sound;
		if (channel.info && window[channel.info.variable]) {
			zones = window[channel.info.variable];
			//console.log(channel.sound,channel.info,channel.info.variable,zones);
		}
		var shift = [{
			when: note.length * beatLen,
			pitch: note.shift + channel.octave * 12 + note.pitch
		}];
		var r = 0.6 - Math.random() * 0.2;
		//this.player.queueWaveTable(this.audioContext, channel.audioNode, channel.sound, when + beatLen * (note.beat - startBeat) + inChordCount * channel.inChordDelay, channel.octave * 12 + note.pitch, 0.075 + note.length * beatLen, r * channel.volumeRatio, shift);
		this.player.queueWaveTable(this.audioContext, channel.audioNode, zones, when + beatLen * (note.beat - startBeat) + inChordCount * channel.inChordDelay, channel.octave * 12 + note.pitch, 0.075 + note.length * beatLen, r * channel.volumeRatio, shift);
		inChordCount++;
	}
};

RiffShareFlat.prototype.addSmallTiles = function (left, top, width, height) {
	var x = 0;
	var y = 0;
	var w = this.innerWidth;
	var h = this.innerHeight;
	var g = this.rakeGroup(x, y, w, h, 'grdlin', this.paneGroup, left, top, width, height);
	var me = this;
	if (g) {
		//this.tileRectangle(g, 0, 0, this.innerWidth, this.innerHeight, 'rgba(0,0,0,0.8)');
		//this.tileText(g, x - this.tapSize * 0.5, y + this.tapSize * 4, this.tapSize * 7, 'RiffShare', '#333');

		this.tileCircle(g, 6 * this.tapSize, 6 * this.tapSize, 5 * this.tapSize, modeDrumShadow(this.bgMode));
		var startLabel = 'Пуск';
		if (this.onAir) {
			startLabel = 'Стоп';
		}
		this.tileText(g, 4 * this.tapSize, y + this.tapSize * 9, this.tapSize * 6, startLabel, modeDrumColor(this.bgMode));
		this.addSpot('plybt', 0, 1 * this.tapSize, this.marginLeft * this.tapSize, this.tapSize * 10, function () {
			if (riffshareflat.onAir) {
				riffshareflat.stopPlay();
			} else {
				//saveString2IndexedDB('testing','123');
				riffshareflat.startPlay();
			}

		});
		/*
		this.tileCircle(g, 1.5 * this.tapSize, (9 + 1.5 * 1) * this.tapSize, 0.5 * this.tapSize, '#999');
		this.tileText(g, 2.5 * this.tapSize, y + this.tapSize * (9.3 + 1.5 * 1), this.tapSize * 0.9, 'Save & Share', '#fff');
		this.addSpot('svsh', 1 * this.tapSize, (8.5 + 1.5 * 1) * this.tapSize, (this.marginLeft - 2) * this.tapSize, this.tapSize, function () {
		window.open('export.html', '_self')
		});*/
		this.tileCircle(g, 11 * this.tapSize, 13 * this.tapSize, 2 * this.tapSize, modeDrumShadow(this.bgMode));
		this.tileText(g, 10.75 * this.tapSize, 13.75 * this.tapSize, 1.5 * this.tapSize, 'Поделиться', modeDrumColor(this.bgMode));
		//this.tileText(g, 10.75 * this.tapSize, 13.75 *this.tapSize , 2.5 * this.tapSize, 'Share '+this.svcntr, modeDrumColor(this.bgMode));
		this.addSpot('shareriff', 9 * this.tapSize, 11 * this.tapSize, 7 * this.tapSize, this.tapSize * 4, function () {
			riffshareflat.saveState();
			var encoded = encodeState();
			//console.log(encoded);
			//return;
			/*
			var url = "https://surikov.github.io/RiffShareAndroid/app/src/main/assets/load.html?riff=" + encoded;
			var tiny = 'https://tinyurl.com/create.php?url=' + url;
			window.open(tiny, '_self')
			 */
			var top = 0;
			for (var i = 0; i < me.trackInfo.length; i++) {
				if (me.trackInfo[i].order == 0) {
					top = i;
					break;
				}
			}
			//var url = "https://zvoog.app/x/share.php?top=" + top + "&mode=" + me.bgMode + "&riff=" + encoded;
			var url = "https://vk.com/app7562667_95994542/#" + encoded;
			//window.open(url, '_self')
			console.log('share', url);
			//bridge.send("VKWebAppShowWallPostBox", { "message": "Hello!" });
			//vkBridge.send('VKWebAppShowWallPostBox', {"message": "Открыть в VKMuzOn " + url})
			vkBridge.send('VKWebAppShare', {"link": url})
				.then(data => {
					console.log('vkBridge data', data);
					riffshareflat.init();
				})
				.catch(error => {
					console.log('vkBridge error', error);
					riffshareflat.init();
				});
		});
		/*
				this.tileCircle(g, 13 * this.tapSize, 17 * this.tapSize, 1 * this.tapSize, modeDrumShadow(this.bgMode));
				this.tileText(g, 12.75 * this.tapSize, 17.75 * this.tapSize, 1.5 * this.tapSize, 'Помощь', modeDrumColor(this.bgMode));
				this.addSpot('helpshareriff', 12 * this.tapSize, 16 * this.tapSize, 7 * this.tapSize, this.tapSize * 2, function () {
					riffshareflat.saveState();
					window.open('index.html', '_self')
				});
		*/
		this.tileCircle(g, 4 * this.tapSize, 15 * this.tapSize, 3 * this.tapSize, modeDrumShadow(this.bgMode));
		this.tileText(g, 3 * this.tapSize, y + this.tapSize * 17, 3 * this.tapSize, 'Помощь', modeDrumColor(this.bgMode));
		this.addSpot('flop', 0, 12 * this.tapSize, 6 * this.tapSize, this.tapSize * 6, function () {
			riffshareflat.saveState();
			//window.open('file.html', '_self')
			//promptFile();
			//window.open('index.html', '_self')
			switchHelp();
		});
		this.tileCircle(g, 3 * this.tapSize, 21 * this.tapSize, 2 * this.tapSize, modeDrumShadow(this.bgMode));
		this.tileText(g, 2.5 * this.tapSize, y + this.tapSize * 22, 2 * this.tapSize, 'Удалить всё', modeDrumColor(this.bgMode));
		this.addSpot('clrsng', 0, 19 * this.tapSize, this.marginLeft * this.tapSize, 4 * this.tapSize, function () {
			riffshareflat.userActionClearAll();
		});

		this.tileCircle(g, 7 * this.tapSize, 52 * this.tapSize, 0.5 * this.tapSize, this.findTrackInfo(0).color);
		//this.tileText(g, 7 * this.tapSize, y + this.tapSize * 52.3, this.tapSize * 1.0, 'Swap with ' + this.findTrackInfo(1).title, this.findTrackInfo(1).color);
		this.tileText(g, 7 * this.tapSize, y + this.tapSize * 52.3, this.tapSize * 0.75, 'Сменить на ' + this.findTrackTitle(this.findTrackNum(1)), this.findTrackInfo(1).color);

		this.addSpot('swp', 6.5 * this.tapSize, 51.5 * this.tapSize, (this.marginLeft - 7.5) * this.tapSize, this.tapSize, function () {
			//console.log(riffshareflat.findTrackInfo(0).title,'<->',riffshareflat.findTrackInfo(1).title);
			riffshareflat.userActionSwap(); //riffshareflat.findTrackInfo(0).nn,riffshareflat.findTrackInfo(1).nn);
		});
		this.tileCircle(g, 1.5 * this.tapSize, 52 * this.tapSize, 0.5 * this.tapSize, this.findTrackInfo(0).color);
		this.tileCircle(g, 2.5 * this.tapSize, 52 * this.tapSize, 0.5 * this.tapSize, this.findTrackInfo(0).color);
		this.tileCircle(g, 3.5 * this.tapSize, 52 * this.tapSize, 0.5 * this.tapSize, this.findTrackInfo(0).color);
		this.tileText(g, 4.1 * this.tapSize, y + this.tapSize * 52.3, this.tapSize * 0.75, 'трек', this.findTrackInfo(0).color);

		this.tileLine(g, 1.5 * this.tapSize, 52 * this.tapSize - 0.35 * this.tapSize, 1.5 * this.tapSize - 0.3 * this.tapSize, 52 * this.tapSize - 0.05 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);
		this.tileLine(g, 1.5 * this.tapSize, 52 * this.tapSize - 0.35 * this.tapSize, 1.5 * this.tapSize + 0.3 * this.tapSize, 52 * this.tapSize - 0.05 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);
		this.tileLine(g, 1.5 * this.tapSize, 52 * this.tapSize - 0.15 * this.tapSize, 1.5 * this.tapSize - 0.3 * this.tapSize, 52 * this.tapSize + 0.15 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);
		this.tileLine(g, 1.5 * this.tapSize, 52 * this.tapSize - 0.15 * this.tapSize, 1.5 * this.tapSize + 0.3 * this.tapSize, 52 * this.tapSize + 0.15 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);

		this.tileLine(g, 2.5 * this.tapSize, 52 * this.tapSize + 0.35 * this.tapSize, 2.5 * this.tapSize - 0.3 * this.tapSize, 52 * this.tapSize + 0.05 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);
		this.tileLine(g, 2.5 * this.tapSize, 52 * this.tapSize + 0.35 * this.tapSize, 2.5 * this.tapSize + 0.3 * this.tapSize, 52 * this.tapSize + 0.05 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);
		this.tileLine(g, 2.5 * this.tapSize, 52 * this.tapSize + 0.15 * this.tapSize, 2.5 * this.tapSize - 0.3 * this.tapSize, 52 * this.tapSize - 0.15 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);
		this.tileLine(g, 2.5 * this.tapSize, 52 * this.tapSize + 0.15 * this.tapSize, 2.5 * this.tapSize + 0.3 * this.tapSize, 52 * this.tapSize - 0.15 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);

		//this.tileLine(g, 2.5 * this.tapSize, 52 * this.tapSize + 0.3 * this.tapSize, 2.5 * this.tapSize - 0.3 * this.tapSize, 52 * this.tapSize - 0.1 * this.tapSize, '#000', 0.1 * this.tapSize);
		//this.tileLine(g, 2.5 * this.tapSize, 52 * this.tapSize + 0.3 * this.tapSize, 2.5 * this.tapSize + 0.3 * this.tapSize, 52 * this.tapSize - 0.1 * this.tapSize, '#000', 0.1 * this.tapSize);

		this.tileLine(g, 3.5 * this.tapSize - 0.2 * this.tapSize, 52 * this.tapSize - 0.2 * this.tapSize, 3.5 * this.tapSize + 0.2 * this.tapSize, 52 * this.tapSize + 0.2 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);
		this.tileLine(g, 3.5 * this.tapSize + 0.2 * this.tapSize, 52 * this.tapSize - 0.2 * this.tapSize, 3.5 * this.tapSize - 0.2 * this.tapSize, 52 * this.tapSize + 0.2 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);
		this.addSpot('octup', 1 * this.tapSize, 51.5 * this.tapSize, this.tapSize, this.tapSize, function () {
			riffshareflat.userUpInstrument();
		});
		this.addSpot('octdwn', 2 * this.tapSize, 51.5 * this.tapSize, this.tapSize, this.tapSize, function () {
			riffshareflat.userDownInstrument();
		});
		this.addSpot('clrtrak', 3 * this.tapSize, 51.5 * this.tapSize, this.tapSize, this.tapSize, function () {
			riffshareflat.userClearInstrument();
		});
		/*this.tileCircle(g, 7 * this.tapSize, 51.5 * this.tapSize, 0.5 * this.tapSize, '#999');
		this.tileText(g, 8 * this.tapSize, y + this.tapSize * 51.8, this.tapSize * 0.9, 'Transpose down', this.findTrackInfo(0).color);
		this.addSpot('trdwn', 6.5 * this.tapSize, 51 * this.tapSize, (this.marginLeft - 2) * this.tapSize, this.tapSize, function () {
		console.log('trdwn');
		});
		this.tileCircle(g, 7 * this.tapSize, 50.5 * this.tapSize, 0.5 * this.tapSize, '#999');
		this.tileText(g, 8 * this.tapSize, y + this.tapSize * 50.8, this.tapSize * 0.9, 'Transpose up', this.findTrackInfo(0).color);
		this.addSpot('trupp', 6.5 * this.tapSize, 50 * this.tapSize, (this.marginLeft - 2) * this.tapSize, this.tapSize, function () {
		console.log('trupp');
		});*/

		var in16 = riffshareflat.cauntToneMeasures(this.findTrackInfo(0).nn);

		var stopX = (16 * in16 + this.marginLeft + 0.5) * this.tapSize;
		//console.log('len',riffshareflat.cauntMeasures());
		this.tileCircle(g, stopX, 0.5 * this.tapSize, 0.5 * this.tapSize, modeDrumShadow(this.bgMode));
		this.tileText(g, stopX - 0.25 * this.tapSize, 0.75 * this.tapSize, this.tapSize * 0.75, 'Повторить ' + this.findTrackInfo(0).title, this.findTrackInfo(0).color);
		this.addSpot('rptins', stopX - 0.5 * this.tapSize, 0, this.tapSize, this.tapSize, function () {
			riffshareflat.userRepeatInstrument();
		});
		var dr16 = riffshareflat.cauntDrumMeasures();
		stopX = (16 * dr16 + this.marginLeft + 0.5) * this.tapSize;
		this.tileCircle(g, stopX, (12 * 5 + 8 + 1.5) * this.tapSize, 0.5 * this.tapSize, modeDrumShadow(this.bgMode));
		this.tileText(g, stopX - 0.25 * this.tapSize, (12 * 5 + 8 + 1.75) * this.tapSize, this.tapSize * 0.75, 'Повторить барабаны', modeDrumColor(this.bgMode));
		this.addSpot('rptdrms', stopX - 0.5 * this.tapSize, (12 * 5 + 8 + 1) * this.tapSize, this.tapSize, this.tapSize, function () {
			//console.log('rptdrms');
			riffshareflat.userRepeatDrums();
		});
		for (var i = 0; i < dr16; i++) {
			var bx = (16 * i + this.marginLeft + 15.5) * this.tapSize;
			var by = (12 * 5 + 8 + 1.5) * this.tapSize;
			this.tileCircle(g, bx, by, 0.5 * this.tapSize, modeDrumShadow(this.bgMode));
			this.tileLine(g, bx - 0.2 * this.tapSize, by - 0.2 * this.tapSize, bx + 0.2 * this.tapSize, by + 0.2 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);
			this.tileLine(g, bx + 0.2 * this.tapSize, by - 0.2 * this.tapSize, bx - 0.2 * this.tapSize, by + 0.2 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);
			s = this.addSpot('clrdrmmsr' + i, bx - 0.5 * this.tapSize, by - 0.5 * this.tapSize, this.tapSize, this.tapSize, function () {
				//console.log('clrdrmmsr',this.i);
				riffshareflat.userClearDrumMeasure(this.i);
			});
			s.i = i;
		}










		this.tileCircle(g, (this.marginLeft + 0.5) * this.tapSize, (12 * 5 + 8 + 1.5) * this.tapSize, 0.5 * this.tapSize, modeDrumShadow(this.bgMode));
		this.tileText(g, (this.marginLeft + 0.5) * this.tapSize, (12 * 5 + 8 + 1.75) * this.tapSize, this.tapSize * 0.75, 'Удалить барабаны', modeDrumColor(this.bgMode));
		this.addSpot('clrdrms', (this.marginLeft) * this.tapSize, (12 * 5 + 8 + 1) * this.tapSize, this.tapSize, this.tapSize, function () {
			riffshareflat.userClearDrum();
		});

		for (var i = 0; i < in16; i++) {
			var tx = (16 * i + this.marginLeft + 0.5) * this.tapSize;
			var ty = 0.5 * this.tapSize;
			this.tileCircle(g, tx, ty, 0.5 * this.tapSize, this.findTrackInfo(0).color);
			this.tileLine(g, tx, ty - 0.3 * this.tapSize, tx - 0.3 * this.tapSize, ty + 0.1 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);
			this.tileLine(g, tx, ty - 0.3 * this.tapSize, tx + 0.3 * this.tapSize, ty + 0.1 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);
			var s = this.addSpot('supins' + i, tx - 0.5 * this.tapSize, 0, this.tapSize, this.tapSize, function () {
				//console.log('up' + this.i);
				riffshareflat.userUpMeasure(this.i);
			});
			s.i = i;
			this.tileCircle(g, tx + this.tapSize, ty, 0.5 * this.tapSize, this.findTrackInfo(0).color);
			this.tileLine(g, tx + this.tapSize, ty + 0.3 * this.tapSize, tx + 0.7 * this.tapSize, ty - 0.1 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);
			this.tileLine(g, tx + this.tapSize, ty + 0.3 * this.tapSize, tx + 1.3 * this.tapSize, ty - 0.1 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);
			s = this.addSpot('sdwnins' + i, tx + 0.5 * this.tapSize, 0, this.tapSize, this.tapSize, function () {
				//console.log('down' + this.i);
				riffshareflat.userDownMeasure(this.i);
			});
			s.i = i;

			var bx = (16 * i + this.marginLeft + 15.5) * this.tapSize;
			/*
			 */

			var by = 0.5 * this.tapSize;
			this.tileCircle(g, bx, by, 0.5 * this.tapSize, this.findTrackInfo(0).color);
			this.tileLine(g, bx - 0.2 * this.tapSize, by - 0.2 * this.tapSize, bx + 0.2 * this.tapSize, by + 0.2 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);
			this.tileLine(g, bx + 0.2 * this.tapSize, by - 0.2 * this.tapSize, bx - 0.2 * this.tapSize, by + 0.2 * this.tapSize, modeBackground(this.bgMode), 0.1 * this.tapSize);
			s = this.addSpot('clrinsmsr' + i, bx - 0.5 * this.tapSize, by - 0.5 * this.tapSize, this.tapSize, this.tapSize, function () {
				//console.log('clrinsmsr',this.i);
				riffshareflat.userClearMeasure(this.i);
			});
			s.i = i;

		}

	}

	//this.tileFrets(left, top, width, height);
	this.tileEqualizer(left, top, width, height);
	this.tileDrumVolumes(left, top, width, height);
	this.tileToneVolumes(left, top, width, height);
	this.tileTempo(left, top, width, height);
	this.tileColorMode(left, top, width, height);
	this.tilePianoLines(left, top, width, height);
	this.tileCounter(left, top, width, height);

	try {
		this.tileDrums(left, top, width, height);
	} catch (e) {
		console.log(e);
	}
	try {
		this.tileTones(left, top, width, height);
	} catch (e) {
		console.log(e);
	}
};
RiffShareFlat.prototype.tileDrumMeasure = function (n, left, top, width, height) {
	var x = this.tapSize * (this.marginLeft + n * 16);
	var y = this.tapSize * (this.marginTop + 12 * 5);
	var w = this.tapSize * 16;
	var h = this.tapSize * 8;
	var g = this.rakeGroup(x, y, w, h, 'drms' + n, this.drumGroup, left, top, width, height);
	if (g) {
		var track = this.findTrackInfo(0);
		this.tileText(g, x + this.tapSize * 13, y + this.tapSize * 2.5, this.tapSize * 3, '' + (n + 1), track.color);
		for (var i = 0; i < 8; i++) {
			this.tileRectangle(g, x + this.tapSize * (0 + i * 2), y + this.tapSize * (0 + 0 * 2), this.tapSize * 1, this.tapSize * 1, 'rgba(127,127,127,0.05)');
			this.tileRectangle(g, x + this.tapSize * (1 + i * 2), y + this.tapSize * (1 + 0 * 2), this.tapSize * 1, this.tapSize * 1, 'rgba(127,127,127,0.10)');
			this.tileRectangle(g, x + this.tapSize * (0 + i * 2), y + this.tapSize * (0 + 1 * 2), this.tapSize * 1, this.tapSize * 1, 'rgba(127,127,127,0.15)');
			this.tileRectangle(g, x + this.tapSize * (1 + i * 2), y + this.tapSize * (1 + 1 * 2), this.tapSize * 1, this.tapSize * 1, 'rgba(127,127,127,0.20)');
			this.tileRectangle(g, x + this.tapSize * (0 + i * 2), y + this.tapSize * (0 + 2 * 2), this.tapSize * 1, this.tapSize * 1, 'rgba(127,127,127,0.25)');
			this.tileRectangle(g, x + this.tapSize * (1 + i * 2), y + this.tapSize * (1 + 2 * 2), this.tapSize * 1, this.tapSize * 1, 'rgba(127,127,127,0.30)');
			this.tileRectangle(g, x + this.tapSize * (0 + i * 2), y + this.tapSize * (0 + 3 * 2), this.tapSize * 1, this.tapSize * 1, 'rgba(127,127,127,0.35)');
			this.tileRectangle(g, x + this.tapSize * (1 + i * 2), y + this.tapSize * (1 + 3 * 2), this.tapSize * 1, this.tapSize * 1, 'rgba(127,127,127,0.40)');
		}
		/*for (var i = 0; i < 8; i++) {
		for (var k = 0; k < 4; k++) {
		this.tileRectangle(g, x + this.tapSize * (0 + i * 2), y + this.tapSize * (0 + k * 2), this.tapSize * 1, this.tapSize * 1, 'rgba(127,127,127,0.55)');
		this.tileRectangle(g, x + this.tapSize * (1 + i * 2), y + this.tapSize * (1 + k * 2), this.tapSize * 1, this.tapSize * 1, 'rgba(127,127,127,0.55)');
		}
		}*/
		for (var i = 0; i < this.storeDrums.length; i++) {
			if (this.storeDrums[i].beat >= n * 16 && this.storeDrums[i].beat < (n + 1) * 16) {
				var xx = x + this.tapSize * (0.5 + this.storeDrums[i].beat - n * 16);
				var yy = y + this.tapSize * (0.5 + this.storeDrums[i].drum);
				this.tileLine(g, xx, yy, 1 + xx, yy, modeDrumColor(this.bgMode), this.tapSize);
			}
		}
	}
};
RiffShareFlat.prototype.existsDrum = function (beat, drum) {
	for (var i = 0; i < this.storeDrums.length; i++) {
		if (this.storeDrums[i].beat == beat && this.storeDrums[i].drum == drum) {
			return true;
		}
	}
	return false;
}
RiffShareFlat.prototype.dropDrum = function (beat, drum) {
	for (var i = 0; i < this.storeDrums.length; i++) {
		if (this.storeDrums[i].beat == beat && this.storeDrums[i].drum == drum) {
			this.storeDrums.splice(i, 1);
			break;
		}
	}
}
RiffShareFlat.prototype.setDrum = function (beat, drum) {
	this.dropDrum(beat, drum);
	this.storeDrums.push({
		beat: beat,
		drum: drum
	});
}
RiffShareFlat.prototype.tilePianoLines = function (left, top, width, height) {
	var x = this.tapSize * this.marginLeft;
	var y = this.tapSize * this.marginTop;
	var w = this.tapSize * 16 * 17;
	var h = this.tapSize * 12 * 5;
	var g = this.rakeGroup(x, y, w, h, 'pnlins', this.linesGroup, left, top, width, height);
	if (g) {
		if (this.bgMode == 2) {
			for (var i = 0; i < 5; i++) {
				this.tileRectangle(g, x, y + this.tapSize * (10 + i * 12), w, this.tapSize * 0.9, 'rgba(0,0,0,0.05)');
				this.tileRectangle(g, x, y + this.tapSize * (8 + i * 12), w, this.tapSize * 0.9, 'rgba(0,0,0,0.05)');
				this.tileRectangle(g, x, y + this.tapSize * (7 + i * 12), w, this.tapSize * 0.05, 'rgba(0,0,0,0.05)');
				this.tileRectangle(g, x, y + this.tapSize * (5 + i * 12), w, this.tapSize * 0.9, 'rgba(0,0,0,0.05)');
				this.tileRectangle(g, x, y + this.tapSize * (3 + i * 12), w, this.tapSize * 0.9, 'rgba(0,0,0,0.05)');
				this.tileRectangle(g, x, y + this.tapSize * (1 + i * 12), w, this.tapSize * 0.9, 'rgba(0,0,0,0.05)');
				//this.tileRectangle(g, x, y + this.tapSize * (0 + i * 12), w, this.tapSize * 0.9, 'rgba(0,0,0,0.05)');
				//this.tileRectangle(g, x, y + this.tapSize * (2 + i * 12), w, this.tapSize * 0.9, 'rgba(0,0,0,0.05)');
				//this.tileRectangle(g, x, y + this.tapSize * (4 + i * 12), w, this.tapSize * 0.9, 'rgba(0,0,0,0.05)');
				//this.tileRectangle(g, x, y + this.tapSize * (6 + i * 12), w, this.tapSize * 0.9, 'rgba(0,0,0,0.05)');
				//this.tileRectangle(g, x, y + this.tapSize * (7 + i * 12), w, this.tapSize * 0.9, 'rgba(0,0,0,0.05)');
				//this.tileRectangle(g, x, y + this.tapSize * (9 + i * 12), w, this.tapSize * 0.9, 'rgba(0,0,0,0.05)');
				//this.tileRectangle(g, x, y + this.tapSize * (11 + i * 12), w, this.tapSize * 0.9, 'rgba(0,0,0,0.05)');
			}
		} else {
			for (var i = 0; i < 5; i++) {
				this.tileRectangle(g, x, y + this.tapSize * (0 + i * 12), w, this.tapSize * 0.9, 'rgba(255,255,255,0.05)');
				this.tileRectangle(g, x, y + this.tapSize * (2 + i * 12), w, this.tapSize * 0.9, 'rgba(255,255,255,0.05)');
				this.tileRectangle(g, x, y + this.tapSize * (4 + i * 12), w, this.tapSize * 0.9, 'rgba(255,255,255,0.05)');
				this.tileRectangle(g, x, y + this.tapSize * (6 + i * 12), w, this.tapSize * 0.9, 'rgba(255,255,255,0.05)');
				this.tileRectangle(g, x, y + this.tapSize * (7 + i * 12), w, this.tapSize * 0.9, 'rgba(255,255,255,0.05)');
				this.tileRectangle(g, x, y + this.tapSize * (9 + i * 12), w, this.tapSize * 0.9, 'rgba(255,255,255,0.05)');
				this.tileRectangle(g, x, y + this.tapSize * (11 + i * 12), w, this.tapSize * 0.9, 'rgba(255,255,255,0.05)');
			}
		}

		//for (var i = 0; i < 5; i++) {
		//for (var k = 0; k < 16 * 16; k++) {
		//this.tileText(g, x + this.tapSize * k*16, y + this.tapSize * (i*12+11+0.75), 1.4*this.tapSize, 'C' + (5-i) , '#000');
		/*this.tileText(g, x + this.tapSize * (0.2+k*16), y + this.tapSize * (i*12+11+0.75-2), 1.4*this.tapSize, 'D' , '#000');
		this.tileText(g, x + this.tapSize * (0.2+k*16), y + this.tapSize * (i*12+11+0.75-4), 1.4*this.tapSize, 'E' , '#000');
		this.tileText(g, x + this.tapSize * (0.2+k*16), y + this.tapSize * (i*12+11+0.75-5), 1.4*this.tapSize, 'F' , '#000');
		this.tileText(g, x + this.tapSize * (0.2+k*16), y + this.tapSize * (i*12+11+0.75-7), 1.4*this.tapSize, 'G' , '#000');
		this.tileText(g, x + this.tapSize * (0.2+k*16), y + this.tapSize * (i*12+11+0.75-9), 1.4*this.tapSize, 'A' , '#000');
		this.tileText(g, x + this.tapSize * (0.2+k*16), y + this.tapSize * (i*12+11+0.75-11), 1.4*this.tapSize, 'B' , '#000');*/
		//}
		//}
		for (var i = 1; i < 16 * 16; i++) {
			this.tileRectangle(g, x + this.tapSize * i, y, this.tapSize * 0.03, this.tapSize * 5 * 12, modeBackground(this.bgMode));
		}
		var track = this.findTrackInfo(0);
		for (var i = 0; i < 4; i++) {
			this.tileRectangle(g, x, y + this.tapSize * (11.94 + i * 12), w, this.tapSize * 0.03, track.color);
		}
		for (var i = 16; i < 16 * 16; i = i + 16) {
			this.tileRectangle(g, x + this.tapSize * i, y, this.tapSize * 0.05, this.tapSize * (8 + 5 * 12 + 1), track.color);
		}
		for (var i = 0; i < 16 * 16; i = i + 16) {

			this.tileRectangle(g, x + this.tapSize * (i + 8.05), y, this.tapSize * 0.007, this.tapSize * (8 + 5 * 12), track.color); //modeBackground(this.bgMode));
		}
	}
};
RiffShareFlat.prototype.tileDrums = function (left, top, width, height) {
	for (var i = 0; i < 16; i++) {
		this.tileDrumMeasure(i, left, top, width, height);
	}
	this.addSpot('drumSpot', this.tapSize * this.marginLeft, this.tapSize * (this.marginTop + 12 * 5), this.tapSize * 16 * 16, this.tapSize * 8, function () {
		var beat = Math.floor((riffshareflat.clickContentX - riffshareflat.tapSize * riffshareflat.marginLeft) / riffshareflat.tapSize);
		var drum = Math.floor((riffshareflat.clickContentY - riffshareflat.tapSize * (riffshareflat.marginTop + 12 * 5)) / riffshareflat.tapSize);
		if (riffshareflat.existsDrum(beat, drum)) {
			riffshareflat.userActionDropDrum(beat, drum);
		} else {
			riffshareflat.userActionAddDrum(beat, drum);
		}
	});
};
RiffShareFlat.prototype.findNote = function (beat, pitch, track) {
	for (var i = 0; i < this.storeTracks.length; i++) {
		if (this.storeTracks[i].track == track && this.storeTracks[i].pitch == pitch && this.storeTracks[i].beat == beat) {
			return this.storeTracks[i];
		}
	}
	return null;
};
RiffShareFlat.prototype.dropNote = function (beat, pitch, track) {
	for (var i = 0; i < this.storeTracks.length; i++) {
		if (this.storeTracks[i].track == track && this.storeTracks[i].pitch == pitch && this.storeTracks[i].beat == beat) {
			this.storeTracks.splice(i, 1);
			break;
		}
	}
};
RiffShareFlat.prototype.addNote = function (beat, pitch, track, length, shift) {
	this.storeTracks.push({
		beat: beat,
		pitch: pitch,
		track: track,
		length: length,
		shift: shift
	});
};
RiffShareFlat.prototype.pitchName = function (pitch) {
	var o = Math.ceil(pitch / 12);
	var n = pitch % 12;
	var t = 'C';
	if (n == 1) {
		t = 'C#';
	}
	if (n == 2) {
		t = 'D';
	}
	if (n == 3) {
		t = 'D#';
	}
	if (n == 4) {
		t = 'E';
	}
	if (n == 5) {
		t = 'F';
	}
	if (n == 6) {
		t = 'F#';
	}
	if (n == 7) {
		t = 'G';
	}
	if (n == 8) {
		t = 'G#';
	}
	if (n == 9) {
		t = 'A';
	}
	if (n == 10) {
		t = 'A#';
	}
	if (n == 11) {
		t = 'B';
	}
	return '' + t;
}
RiffShareFlat.prototype.tilePartTones = function (measure, octave, track, left, top, width, height, bottom) {
	var x = this.tapSize * (this.marginLeft + 16 * measure);
	var y = this.tapSize * (this.marginTop + 12 * (4 - octave));
	var w = this.tapSize * 16;
	var h = this.tapSize * 12;
	var g = this.rakeGroup(x, y, w, h, 'tnOm' + measure + 'x' + octave + 'x' + track.nn, this.trackGroups[track.order], left, top, width, height);
	if (g) {
		/*if(bottom){
		this.tileText(g, x+0.1*this.tapSize , y +11.7*this.tapSize, 1.2*this.tapSize, 'C' + (octave+1) , '#000');
		}*/
		for (var i = 0; i < this.storeTracks.length; i++) {
			var p = this.storeTracks[i];
			if (p.track == track.nn) {
				if (p.beat >= measure * 16) {
					if (p.beat < (measure + 1) * 16) {
						if (p.pitch >= octave * 12) {
							if (p.pitch < (1 + octave) * 12) {
								var far = track.order * 0.03 * this.tapSize;
								var xx = x + this.tapSize * (0.5 + p.beat % 16) + far;
								var yy = y + this.tapSize * (12.5 - p.pitch % 12 - 1) - far;
								var le = p.length - 1;
								var r = this.tapSize;
								if (track.order > 0) {
									this.tileLine(g, xx, yy, 1 + xx + this.tapSize * le, yy - this.tapSize * p.shift, track.shadow, r);
								} else {
									this.tileLine(g, xx, yy, 1 + xx + this.tapSize * le, yy - this.tapSize * p.shift, track.color, r);
									//this.tileCircle(g, xx, yy, this.tapSize / 5, '#000');
									this.tileText(g, xx - 0.2 * this.tapSize, yy + 0.3 * this.tapSize, 0.75 * this.tapSize, this.pitchName(p.pitch), modeNoteName(this.bgMode));
								}
							}
						}
					}
				}
			}
		}
	}
};

RiffShareFlat.prototype.tileCounter = function (left, top, width, height) {
	if (this.onAir) {
		var x = this.tapSize * this.marginLeft;
		var y = 0;
		var w = this.innerWidth;
		var h = this.innerHeight;
		var g = this.rakeGroup(x, y, w, h, 'cntr', this.counterGroup, left, top, width, height);
		if (g) {
			this.tileRectangle(g, 0, 0, this.tapSize * 0.001, this.tapSize * 0.001, '#000');
			this.tileRectangle(g, this.innerWidth, this.innerHeight, this.tapSize * 0.001, this.tapSize * 0.001, '#000');

			this.counterLine = this.tileRectangle(g, x + this.tapSize * 0.3, y, this.tapSize * 0.4, h, this.findTrackInfo(0).shadow);
		}
	}
};
RiffShareFlat.prototype.tileTones = function (left, top, width, height) {
	for (var m = 0; m < 16; m++) {
		for (var o = 0; o < 5; o++) {
			for (var t = 0; t < 8; t++) {
				this.tilePartTones(m, o, this.findTrackInfo(7 - t), left, top, width, height, t == 0);
			}
		}
	}
	if (this.mark) {
		var x = this.tapSize * (this.marginLeft + this.mark.beat);
		var y = this.tapSize * (this.marginTop + 12 * 5 - this.mark.pitch - 1);
		var w = this.tapSize;
		var h = this.tapSize;
		var g = this.rakeGroup(x, y, w, h, 'mrk', this.upperGroup, left, top, width, height);
		if (g) {
			this.tileCircle(g, x + this.tapSize * 0.5, y + this.tapSize * 0.5, this.tapSize / 3, 'rgba(127,127,127,0.5)');
		}
	}
	this.addSpot('toneSpot', this.tapSize * this.marginLeft, this.tapSize * this.marginTop, this.tapSize * 16 * 17, this.tapSize * 12 * 5, function () {
		var beat = Math.floor((riffshareflat.clickContentX - riffshareflat.tapSize * riffshareflat.marginLeft) / riffshareflat.tapSize);
		var pitch = 60 - Math.floor((riffshareflat.clickContentY - riffshareflat.tapSize * riffshareflat.marginTop) / riffshareflat.tapSize) - 1;
		var nn = riffshareflat.findTrackInfo(0).nn;
		if (riffshareflat.findNote(beat, pitch, nn)) {
			riffshareflat.userActionDropNote(beat, pitch, nn);
		} else {
			if (riffshareflat.mark) {
				var abeat = riffshareflat.mark.beat;
				var alength = beat - riffshareflat.mark.beat + 1;
				var apitch = riffshareflat.mark.pitch;
				var ashift = pitch - riffshareflat.mark.pitch;
				if (abeat > beat) {
					abeat = beat;
					alength = riffshareflat.mark.beat + 1 - beat;
					apitch = pitch;
					ashift = riffshareflat.mark.pitch - pitch;
				}
				riffshareflat.userActionAddNote(abeat, apitch, nn, alength, ashift);
				riffshareflat.mark = null;
			} else {
				if (beat < 16 * 16) {
					riffshareflat.mark = {
						beat: beat,
						pitch: pitch
					};
				}
			}
		}

	});
};
RiffShareFlat.prototype.setModeBackground = function (bgMode) {
	//console.log('setModeBackground', bgMode);
	this.bgMode = bgMode;
	saveText2localStorage('bgMode', '' + bgMode);
	//console.log(this.bgMode,modeBackground(this.bgMode));
	this.contentDiv.style.background = modeBackground(this.bgMode);
};
/*
RiffShareFlat.prototype.modeDrumColor = function (bgMode) {
if (bgMode == 2) {
return '#033';
}
return '#ccc';
};
RiffShareFlat.prototype.modeDrumShadow = function (bgMode) {
if (bgMode == 2) {
return '#9a9';
}
return '#666';
};
RiffShareFlat.prototype.modeBackground = function (bgMode) {
if (bgMode == 1) {
return '#31424C';
}
if (bgMode == 2) {
//return '#C8D1D2';
return '#eef';
}
return '#000609';
};*/
RiffShareFlat.prototype.tileColorMode = function (left, top, width, height) {
	var x = this.tapSize * (this.marginLeft - 12);
	var y = this.tapSize * (this.marginTop + 12 * 5 - 36 + 1 - 2);
	var w = this.tapSize * 12;
	var h = this.tapSize * 2;
	var g = this.rakeGroup(x, y, w, h, 'colorscheme', this.textGroup, left, top, width, height);
	var cw = 11 / 3;
	if (g) {
		this.tileText(g, x - this.tapSize * 5.5, y + this.tapSize * 0.75, this.tapSize, 'Цвета', modeDrumColor(this.bgMode));
		for (var i = 0; i < 3; i++) {
			this.tileRectangle(g, x + this.tapSize * cw * i, y, this.tapSize * (cw - 0.1), this.tapSize * 0.9, modeBackground(i));
			var s = this.addSpot('colorscheme' + i, x + this.tapSize * cw * i, y, this.tapSize * cw, this.tapSize, function () {
				//console.log('spot', this);
				//riffshareflat.setModeBackground(this.bgm)
				riffshareflat.userActionChangeScheme(this.bgm);
			});
			s.bgm = i;
		}
	}
};

RiffShareFlat.prototype.tileTempo = function (left, top, width, height) {
	var x = this.tapSize * (this.marginLeft - 12);
	var y = this.tapSize * (this.marginTop + 12 * 5 - 36 + 1);
	var w = this.tapSize * 12;
	var h = this.tapSize * 8;
	var g = this.rakeGroup(x, y, w, h, 'tmpo', this.textGroup, left, top, width, height);
	var cw = 11 / 9;
	if (g) {
		this.tileRectangle(g, x, y + this.tapSize * 0, this.tapSize * 11, this.tapSize * 0.9, modeDrumShadow(this.bgMode));
		this.tileRectangle(g, x, y + this.tapSize * 0, this.tapSize * cw * (this.tempo - 60) / 20, this.tapSize * 0.9, modeDrumColor(this.bgMode));
		this.tileText(g, x - this.tapSize * 5.5, y + this.tapSize * 0.75, this.tapSize, '' + this.tempo + ' bpm', modeDrumColor(this.bgMode));
		for (var i = 0; i < 9; i++) {
			var s = this.addSpot('tempo' + i, x + this.tapSize * cw * i, y, this.tapSize * cw, this.tapSize, function () {
				riffshareflat.userActionTempo(this.tempo);
			});
			s.tempo = i * 20 + 80;
		}
	}
};
RiffShareFlat.prototype.findTrackNum = function (order) {
	//console.log(this.trackInfo);
	for (var i = 0; i < 8; i++) {
		if (this.trackInfo[i].order == order) {
			return i;
		}
	}
	return -1;
};
RiffShareFlat.prototype.findTrackInfo = function (order) {
	//console.log(this.trackInfo);
	for (var i = 0; i < 8; i++) {
		if (this.trackInfo[i].order == order) {
			return this.trackInfo[i];
		}
	}
	return null;
};
RiffShareFlat.prototype.getTrackOrders = function () {
	var o = [];
	for (var i = 0; i < 8; i++) {
		o.push(this.trackInfo[i].order);
	}
	return o;
};
RiffShareFlat.prototype.setTrackOrders = function (o) {
	for (var i = 0; i < 8; i++) {
		this.trackInfo[i].order = o[i];
	}
};
RiffShareFlat.prototype.upTrack = function (order) {
	var track = this.findTrackInfo(order);
	for (var i = 0; i < 8; i++) {
		if (this.trackInfo[i].order < track.order) {
			this.trackInfo[i].order++;
		}
	}
	track.order = 0;
};
RiffShareFlat.prototype.tileToneVolumes = function (left, top, width, height) {
	var x = this.tapSize * (this.marginLeft - 18);
	var y = this.tapSize * (this.marginTop + 12 * 5 - 11);
	var w = this.tapSize * 12;
	var h = this.tapSize * 8;
	var g = this.rakeGroup(x, y, w, h, 'tnvlm', this.linesGroup, left, top, width, height);
	var sk = 0;
	var me = this;
	if (g) {
		for (var i = 0; i < 8; i++) {
			var track = this.findTrackInfo(i);
			if (i > 0) {
				sk = 2;
				//this.tileRectangle(g, x + this.tapSize * (0 + 6), y + this.tapSize * (i + sk), this.tapSize * 11, this.tapSize * 0.9, 'rgba(255,255,255,0.3)');
				this.tileRectangle(g, x + this.tapSize * 6, y + this.tapSize * (i + sk), this.tapSize * (1 + track.volume / 10), this.tapSize * 0.9, track.color);
				//this.tileCircle(g, x + this.tapSize * 1, y + this.tapSize * (i + 0.5 + sk), this.tapSize * 0.5, modeDrumShadow(this.bgMode));
				var s = this.addSpot('up' + i, x + this.tapSize * 0.0, y + this.tapSize * (i + 0.2 + sk), this.tapSize * 17, this.tapSize * 1, function () {
					riffshareflat.userActionUpTrack(this.order);
					//riffshareflat.closeMenuIns();
				});
				s.order = i;
				//console.log(track,this.trackInfo[i].sound.zones[0].buffer);
				//if (this.trackInfo[i].sound.zones[0].buffer) {
				//console.log(i,me.findTrackNum(i));
				this.tileText(g, x + this.tapSize * 0.5, y + this.tapSize * (i + 0.75 + sk), this.tapSize * 0.75, me.findTrackTitle(me.findTrackNum(i)), track.color);
				//}
				/*for (var v = 0; v < 11; v++) {
				var s = this.addSpot('volton' + i + 'x' + v, x + this.tapSize * (6 + v), y + this.tapSize * (i + sk), this.tapSize, this.tapSize, function () {
				riffshareflat.userActionToneVolume(this.track, this.volume);
				});
				s.track = track;
				s.volume = v * 10;
				}*/
			} else {
				this.tileRectangle(g, x + this.tapSize * (0 + 6), y + this.tapSize * (i + sk), this.tapSize * 11, this.tapSize * 0.9, modeDrumShadow(this.bgMode));
				this.tileRectangle(g, x + this.tapSize * 6, y + this.tapSize * (i + sk), this.tapSize * (1 + track.volume / 10), this.tapSize * 0.9, track.color);
				//this.tileCircle(g, x + this.tapSize * 1, y + this.tapSize * (i + 0.5 + sk), this.tapSize * 0.5, modeDrumShadow(this.bgMode));
				/*var s = this.addSpot('up' + i, x + this.tapSize * 0.0, y + this.tapSize * (i + 0.2 + sk), this.tapSize * 5, this.tapSize * 1, function () {
				riffshareflat.userActionUpTrack(this.order);
				});
				s.order = i;*/
				//if (this.trackInfo[i].sound.zones[0].buffer) {
				this.tileText(g, x + this.tapSize * 0.5, y + this.tapSize * (i + 0.75 + sk), this.tapSize * 0.75, me.findTrackTitle(me.findTrackNum(i)), track.color);
				//}
				for (var v = 0; v < 11; v++) {
					var s = this.addSpot('volton' + i + 'x' + v, x + this.tapSize * (6 + v), y + this.tapSize * (i + sk), this.tapSize, this.tapSize, function () {
						riffshareflat.userActionToneVolume(this.track, this.volume);
					});
					s.track = track;
					s.volume = v * 10;
				}
			}
		}
		/*this.addSpot('insUpReplaceSelect', x + this.tapSize * 0, y + this.tapSize * 0, this.tapSize * 2, this.tapSize * 1, function () {
			//console.log('insUpReplaceSelect');
			me.openMenuUpperInstrument();
		});*/
	}
};
RiffShareFlat.prototype.tileDrumVolumes = function (left, top, width, height) {
	var x = this.tapSize * (this.marginLeft - 18);
	var y = this.tapSize * (this.marginTop + 12 * 5);
	var w = this.tapSize * 12;
	var h = this.tapSize * 8;
	var g = this.rakeGroup(x, y, w, h, 'drvlm', this.textGroup, left, top, width, height);
	var me = this;
	if (g) {
		for (var i = 0; i < 8; i++) {
			this.tileRectangle(g, x + this.tapSize * 6, y + this.tapSize * i, this.tapSize * 11, this.tapSize * 0.9, modeDrumShadow(this.bgMode));
			var n = this.drumVolumes[i] / 10;
			if (!(n)) {
				n = 0;
			}
			this.tileRectangle(g, x + this.tapSize * 6, y + this.tapSize * i, this.tapSize * (1 + n), this.tapSize * 0.9, modeDrumColor(this.bgMode));
			for (var v = 0; v < 11; v++) {
				var s = this.addSpot('voldru' + i + 'x' + v, x + this.tapSize * (6 + v), y + this.tapSize * i, this.tapSize, this.tapSize, function () {
					riffshareflat.userActionDrumVolume(this.drum, this.volume);
				});
				s.drum = i;
				s.volume = v * 10;
			}
			//if (this.drumInfo[i].sound.zones[0].buffer) {
			//this.tileCircle(g, x + this.tapSize * 1, y + this.tapSize * (i + 0.5), this.tapSize * 0.5, modeDrumShadow(this.bgMode));
			this.tileText(g, x + this.tapSize * 0.5, y + this.tapSize * (i + 0.75), this.tapSize * 0.75, this.findDrumTitle(i), modeDrumColor(this.bgMode));
			/*var s = this.addSpot('drumReplaceSelect' + i, x + this.tapSize * 0.0, y + this.tapSize * i, this.tapSize * 2, this.tapSize * 1, function () {
				//console.log('drumReplaceSelect',this.order);
				me.openMenuDrum(this.order);
			});
			s.order = i;*/
			//}
		}
		/*
		this.tileText(g, x + this.tapSize * 0.5, y + this.tapSize * 0.75, this.tapSize * 0.9, 'Bass drum', '#ffffff');
		this.tileText(g, x + this.tapSize * 0.5, y + this.tapSize * 1.75, this.tapSize * 0.9, 'Low tom', '#ffffff');
		this.tileText(g, x + this.tapSize * 0.5, y + this.tapSize * 2.75, this.tapSize * 0.9, 'Snare drum', '#ffffff');
		this.tileText(g, x + this.tapSize * 0.5, y + this.tapSize * 3.75, this.tapSize * 0.9, 'Mid Tom', '#ffffff');
		this.tileText(g, x + this.tapSize * 0.5, y + this.tapSize * 4.75, this.tapSize * 0.9, 'Closed Hi-hat', '#ffffff');
		this.tileText(g, x + this.tapSize * 0.5, y + this.tapSize * 5.75, this.tapSize * 0.9, 'Open Hi-hat', '#ffffff');
		this.tileText(g, x + this.tapSize * 0.5, y + this.tapSize * 6.75, this.tapSize * 0.9, 'Ride Cymbal', '#ffffff');
		this.tileText(g, x + this.tapSize * 0.5, y + this.tapSize * 7.75, this.tapSize * 0.9, 'Splash Cymbal', '#ffffff');
		 */
	}
};
RiffShareFlat.prototype.tileFrets = function (left, top, width, height) {
	var x = this.tapSize * (this.marginLeft - 0);
	var y = this.tapSize * (this.marginTop + 12 * 5 + 8 + 1);
	var w = this.tapSize * 16;
	var h = this.tapSize * 6;
	for (var m = 0; m < 16; m++) {
		var g = this.rakeGroup(x + m * 16 * this.tapSize, y, w, h, 'frts' + m, this.textGroup, left, top, width, height);
		if (g) {
			for (var i = 0; i < 6; i++) {
				this.tileRectangle(g, x + m * 16 * this.tapSize, y + (1 + i) * this.tapSize //
					, w, this.tapSize * (0.01 + i / 100) //
					, modeDrumColor(this.bgMode));
			}
			for (var i = 1; i < 16; i++) {
				this.tileRectangle(g, x + (i + m * 16) * this.tapSize, y + 1 * this.tapSize //
					, 0.005 * this.tapSize, h - 1 * this.tapSize //
					, modeDrumColor(this.bgMode));
			}
		}
	}
}
RiffShareFlat.prototype.tileEqualizer = function (left, top, width, height) {
	var x = this.tapSize * (this.marginLeft - 17.5);
	var y = this.tapSize * (this.marginTop + 12 * 5 - 34 + 1);
	var w = this.tapSize * 10;
	var h = this.tapSize * 21;
	var sz = 1.65;
	var g = this.rakeGroup(x, y, w, h, 'eqlzr', this.textGroup, left, top, width, height);
	if (g) {
		for (var i = 0; i < 10; i++) {
			this.tileRectangle(g, x + this.tapSize * i * sz, y, this.tapSize * 0.95 * sz, this.tapSize * 21, modeDrumShadow(this.bgMode));
			var n = this.equalizer[i];
			if (!(n)) {
				n = 0;
			}
			var ey = n < 0 ? y + this.tapSize * 10 : y + this.tapSize * 10 - this.tapSize * n;
			this.tileRectangle(g, x + this.tapSize * i * sz, ey, this.tapSize * 0.95 * sz, this.tapSize * (1 + Math.abs(n)), modeDrumColor(this.bgMode));
			for (var v = -10; v <= 10; v++) {
				var s = this.addSpot('eq' + i + 'x' + v, x + this.tapSize * i * sz, y - this.tapSize * (v - 10), this.tapSize * 0.95 * sz, this.tapSize, function () {
					riffshareflat.userActionEqualizer(this.band, this.volume);
				});
				s.band = i;
				s.volume = v;
			}
		}
		this.tileText(g, x + this.tapSize * (0 * sz + 0.3), y + this.tapSize * 10.75, this.tapSize * 0.75, '65', modeBackground(this.bgMode));
		this.tileText(g, x + this.tapSize * (1 * sz + 0.3), y + this.tapSize * 10.75, this.tapSize * 0.75, '125', modeBackground(this.bgMode));
		this.tileText(g, x + this.tapSize * (2 * sz + 0.3), y + this.tapSize * 10.75, this.tapSize * 0.75, '250', modeBackground(this.bgMode));
		this.tileText(g, x + this.tapSize * (3 * sz + 0.3), y + this.tapSize * 10.75, this.tapSize * 0.75, '500', modeBackground(this.bgMode));
		this.tileText(g, x + this.tapSize * (4 * sz + 0.3), y + this.tapSize * 10.75, this.tapSize * 0.75, '1k', modeBackground(this.bgMode));
		this.tileText(g, x + this.tapSize * (5 * sz + 0.3), y + this.tapSize * 10.75, this.tapSize * 0.75, '1k', modeBackground(this.bgMode));
		this.tileText(g, x + this.tapSize * (6 * sz + 0.3), y + this.tapSize * 10.75, this.tapSize * 0.75, '2k', modeBackground(this.bgMode));
		this.tileText(g, x + this.tapSize * (7 * sz + 0.3), y + this.tapSize * 10.75, this.tapSize * 0.75, '4k', modeBackground(this.bgMode));
		this.tileText(g, x + this.tapSize * (8 * sz + 0.3), y + this.tapSize * 10.75, this.tapSize * 0.75, '8k', modeBackground(this.bgMode));
		this.tileText(g, x + this.tapSize * (9 * sz + 0.3), y + this.tapSize * 10.75, this.tapSize * 0.75, '16k', modeBackground(this.bgMode));
	}
};
RiffShareFlat.prototype.msEdgeHook = function (g) {
	if (g.childNodes && (!(g.children))) {
		g.children = g.childNodes;
		//console.log('try layer.children',layer.children);
	}
};
RiffShareFlat.prototype.clearUselessDetails = function (x, y, w, h, layer) {
	this.msEdgeHook(layer);
	for (var i = 0; i < layer.children.length; i++) {
		var group = layer.children[i];
		this.clearUselessNodes(x, y, w, h, group);
	}
};
RiffShareFlat.prototype.clearUselessNodes = function (x, y, w, h, layer) {
	this.msEdgeHook(layer);
	for (var i = 0; i < layer.children.length; i++) {
		var t = layer.children[i];
		if (this.outOfView(t, x, y, w, h)) {
			layer.removeChild(t);
			i--;
		} else {
			//
		}
	}
};
RiffShareFlat.prototype.outOfView = function (child, x, y, w, h) {
	var tbb = child.getBBox();
	return !(this.collision(tbb.x, tbb.y, tbb.width, tbb.height, x, y, w, h));
};
RiffShareFlat.prototype.clearSpots = function () {
	this.spots = [];
};
RiffShareFlat.prototype.findSpot = function (id) {
	for (var i = 0; i < this.spots.length; i++) {
		if (this.spots[i].id == id) {
			return this.spots[i];
		}
	}
	return null;
};
RiffShareFlat.prototype.dropSpot = function (id) {
	for (var i = 0; i < this.spots.length; i++) {
		if (this.spots[i].id == id) {
			this.spots.splice(i, 1);
			break;
		}
	}
};
RiffShareFlat.prototype.rakeGroup = function (x, y, w, h, id, layer, left, top, width, height) {
	if (this.collision(x, y, w, h, left, top, width, height)) {
		if (!this.childExists(id, layer)) {
			var g = document.createElementNS(this.svgns, 'g');
			g.id = id;
			layer.appendChild(g);
			return g;
		} else {
			//console.log(id,'exists');
		}
	}
	return null;
};
RiffShareFlat.prototype.childExists = function (id, layer) {
	this.msEdgeHook(layer);
	for (var i = 0; i < layer.children.length; i++) {
		var t = layer.children[i];
		if (t.id == id) {
			return true;
		}
	}
	return false;
};
RiffShareFlat.prototype.collision = function (x1, y1, w1, h1, x2, y2, w2, h2) {
	if (x1 + w1 < x2 //
		||
		x1 > x2 + w2 //
		||
		y1 + h1 < y2 //
		||
		y1 > y2 + h2 //
	) {
		return false;
	} else {
		return true;

	}
};
/*
RiffShareFlat.prototype.openMenu = function () {
var o = document.getElementById('menuitems');
var html = '';
for (var i = 0; i < trackInfo.length; i++) {
html = html + "<div id='insLine" + i + "' class='menubuttonRow'>" + trackInfo[i].title + "</div>";
}
for (var i = 0; i < drumInfo.length; i++) {
html = html + "<div id='drmLine" + i + "' class='menubuttonRow'>" + drumInfo[i].title + "</div>";
}
o.innerHTML = html;
o.scrollTop = 0;
document.getElementById('menuDiv').style.width = '7cm';
document.getElementById('menuDiv').style.background = modeBackground(this.bgMode);
document.getElementById('menuDiv').style.color = modeDrumColor(this.bgMode);
for (var i = 0; i < trackInfo.length; i++) {
this.setMenuInsAction(i);
}
for (var i = 0; i < drumInfo.length; i++) {
this.setMenuDrumAction(i);
}
};
RiffShareFlat.prototype.setMenuInsAction = function (n) {
var me = this;
document.getElementById('insLine' + n).onclick = function (e) {
me.openMenuInstrument(n);
};
}
RiffShareFlat.prototype.setMenuDrumAction = function (n) {
var me = this;
document.getElementById('drmLine' + n).onclick = function (e) {
me.openMenuDrum(n);
};
}*/
RiffShareFlat.prototype.findTrackTitle = function (n) {
	var title = this.trackInfo[n].title;
	if (this.trackInfo[n].replacement) {
		if (this.trackInfo[n].info) {
			title = '' + (this.trackInfo[n].replacement - 1) + ': ' + this.trackInfo[n].info.title;
		}
	}
	return title;
};
RiffShareFlat.prototype.findDrumTitle = function (n) {
	var title = this.drumInfo[n].title;
	if (this.drumInfo[n].replacement) {
		title = '' + (this.drumInfo[n].replacement - 1) + ': ' + this.drumInfo[n].info.title;
	}
	return title;
};
/*var menuInstrumentLibFilled = false;
var menuInstrumentLibKey = 0;
RiffShareFlat.prototype.openMenuUpperInstrument = function () {
	var me = this;
	this.closeMenuDrum();
	for (var i = 0; i < this.trackInfo.length; i++) {
		if (this.trackInfo[i].order == 0) {
			menuInstrumentLibKey = i;
			break;
		}
	}
	document.getElementById('menuTitle1').innerText = this.findTrackTitle(menuInstrumentLibKey);
	if (menuInstrumentLibFilled) {
		console.log('skip ins chooser');
	} else {
		console.log('create ins chooser');
		var o = document.getElementById('menuitems1');
		var html = '';
		html = html + "<div id='insLineDefault' class='menubuttonRow'>Default</div>";
		for (var i = 0; i < this.player.loader.instrumentKeys().length; i++) {
			var info = this.player.loader.instrumentInfo(i);
			html = html + "<div id='insSel" + i + "' class='menubuttonRow'>" + i + ': ' + info.title + "</div>";
		}
		html = html + "<div class='menubuttonRow'>&nbsp;</div>";
		html = html + "<div class='menubuttonRow'>&nbsp;</div>";
		html = html + "<div class='menubuttonRow'>&nbsp;</div>";
		o.innerHTML = html;

		for (var i = 0; i < this.player.loader.instrumentKeys().length; i++) {
			this.setMenuInsSelect(i);
		}
		document.getElementById('insLineDefault').onclick = function (e) {
			me.closeMenuIns();
			me.userActionReplaceIns(menuInstrumentLibKey, 0);
			me.resetAllLayersNow();
		};
		menuInstrumentLibFilled = true;
	}
	document.getElementById('menuDiv1').style.width = '7cm';
	document.getElementById('menuDiv1').style.background = modeBackground(this.bgMode);
	document.getElementById('menuDiv1').style.color = modeDrumColor(this.bgMode);
}*/
/*
var menuDrumLibFilled = false;
var menuDrumLibKey = 0;
RiffShareFlat.prototype.openMenuDrum = function (ndrum) {
	var me = this;
	this.closeMenuIns();
	menuDrumLibKey = ndrum;
	document.getElementById('menuTitle2').innerText = this.findDrumTitle(menuDrumLibKey);
	if (menuDrumLibFilled) {
		console.log('skip ins chooser');
	} else {
		var o = document.getElementById('menuitems2');
		var html = '';
		html = html + "<div id='drmLineDefault' class='menubuttonRow'>Default</div>";
		for (var i = 0; i < this.player.loader.drumKeys().length; i++) {
			var info = this.player.loader.drumInfo(i);
			html = html + "<div id='drmSel" + i + "' class='menubuttonRow'>" + i + ': ' + info.title + "</div>";
		}
		html = html + "<div class='menubuttonRow'>&nbsp;</div>";
		html = html + "<div class='menubuttonRow'>&nbsp;</div>";
		html = html + "<div class='menubuttonRow'>&nbsp;</div>";
		o.innerHTML = html;

		for (var i = 0; i < this.player.loader.drumKeys().length; i++) {
			this.setMenuDrumSelect(i);
		}
		document.getElementById('drmLineDefault').onclick = function (e) {
			me.closeMenuDrum();
			me.userActionReplaceDrum(menuDrumLibKey, 0);
			me.resetAllLayersNow();
		};
		menuDrumLibFilled = true;
	}
	document.getElementById('menuDiv2').style.width = '7cm';
	document.getElementById('menuDiv2').style.background = modeBackground(this.bgMode);
	document.getElementById('menuDiv2').style.color = modeDrumColor(this.bgMode);
}*/
/*RiffShareFlat.prototype.setMenuInsSelect = function (inskey) {
	var me = this;
	document.getElementById('insSel' + inskey).onclick = function (e) {
		var info = me.player.loader.instrumentInfo(inskey);
		me.player.loader.startLoad(me.audioContext, info.url, info.variable);
		me.player.loader.waitLoad(function () {
			me.closeMenuIns();
			me.userActionReplaceIns(menuInstrumentLibKey, inskey + 1);
			me.resetAllLayersNow();
		});
	};
}
RiffShareFlat.prototype.setMenuDrumSelect = function (i) {
	var me = this;
	document.getElementById('drmSel' + i).onclick = function (e) {
		var info = me.player.loader.drumInfo(i);
		me.player.loader.startLoad(me.audioContext, info.url, info.variable);
		me.player.loader.waitLoad(function () {
			me.closeMenuDrum();
			me.userActionReplaceDrum(menuDrumLibKey, i + 1);
			me.resetAllLayersNow();
		});
	};
}*/
/*
RiffShareFlat.prototype.closeMenuIns = function () {

	document.getElementById('menuDiv1').style.width = '0cm';
};
RiffShareFlat.prototype.closeMenuDrum = function () {
	document.getElementById('menuDiv2').style.width = '0cm';
};*/
RiffShareFlat.prototype.resetSize = function () {
	
	//console.log('resetSize',this,this.contentSVG);
	
	this.innerWidth = (this.marginLeft + this.marginRight + 16 * 16) * this.tapSize;
	this.innerHeight = (this.marginTop + this.marginBottom + 8 + 5 * 12) * this.tapSize;
	this.contentSVG.style.width = this.contentDiv.clientWidth + 'px';
	this.contentSVG.style.height = this.contentDiv.clientHeight + 'px';

	document.getElementById('undobutton').style.width = this.tapSize + 'px';
	document.getElementById('undobutton').style.height = this.tapSize + 'px';
	document.getElementById('undobutton').style.top = Math.round(this.contentDiv.clientHeight / 2 - this.tapSize * 1.2) + 'px';

	document.getElementById('redobutton').style.width = this.tapSize + 'px';
	document.getElementById('redobutton').style.height = this.tapSize + 'px';
	//document.getElementById('redobutton').style.top = (5 * 2 + this.tapSize) + 'px';
	document.getElementById('redobutton').style.top = Math.round(this.contentDiv.clientHeight / 2) + 'px';

	//document.getElementById('menubutton').style.width = this.tapSize + 'px';
	//document.getElementById('menubutton').style.height = this.tapSize + 'px';
	//document.getElementById('menubutton').style.top = (5 * 2 + 2*this.tapSize) + 'px';
	this.adjustContentPosition();
	this.queueTiles();
};
RiffShareFlat.prototype.tileLine = function (g, x1, y1, x2, y2, strokeColor, strokeWidth) {
	var line = document.createElementNS(this.svgns, 'line');
	line.setAttributeNS(null, 'x1', x1);
	line.setAttributeNS(null, 'y1', y1);
	line.setAttributeNS(null, 'x2', x2);
	line.setAttributeNS(null, 'y2', y2);
	if (strokeColor) {
		line.setAttributeNS(null, 'stroke', strokeColor);
	}
	if (strokeWidth) {
		line.setAttributeNS(null, 'stroke-width', strokeWidth);
	}
	line.setAttributeNS(null, 'stroke-linecap', 'round');
	g.appendChild(line);
	return line;
};
RiffShareFlat.prototype.tileEllipse = function (g, x, y, rx, ry, fillColor, strokeColor, strokeWidth) {
	var e = document.createElementNS(this.svgns, 'ellipse');
	e.setAttributeNS(null, 'cx', x);
	e.setAttributeNS(null, 'cy', y);
	e.setAttributeNS(null, 'rx', rx);
	e.setAttributeNS(null, 'ry', ry);
	if (fillColor) {
		e.setAttributeNS(null, 'fill', fillColor);
	}
	if (strokeColor) {
		e.setAttributeNS(null, 'stroke', strokeColor);
	}
	if (strokeWidth) {
		e.setAttributeNS(null, 'stroke-width', strokeWidth);
	}
	g.appendChild(e);
	return e;
};
/*RiffShareFlat.prototype.tilePolygon = function (g, x, y, r, fillColor, strokeColor, strokeWidth) {
var polygon = document.createElementNS(this.svgns, 'polygon');
polygon.setAttributeNS(null, 'cx', x);
polygon.setAttributeNS(null, 'cy', y);
polygon.setAttributeNS(null, 'r', r);
if (fillColor) {
polygon.setAttributeNS(null, 'fill', fillColor);
}
if (strokeColor) {
polygon.setAttributeNS(null, 'stroke', strokeColor);
}
if (strokeWidth) {
polygon.setAttributeNS(null, 'stroke-width', strokeWidth);
}
g.appendChild(polygon);
return polygon;
};*/
RiffShareFlat.prototype.tileCircle = function (g, x, y, r, fillColor, strokeColor, strokeWidth) {
	var circle = document.createElementNS(this.svgns, 'circle');
	circle.setAttributeNS(null, 'cx', x);
	circle.setAttributeNS(null, 'cy', y);
	circle.setAttributeNS(null, 'r', r);
	if (fillColor) {
		circle.setAttributeNS(null, 'fill', fillColor);
	}
	if (strokeColor) {
		circle.setAttributeNS(null, 'stroke', strokeColor);
	}
	if (strokeWidth) {
		circle.setAttributeNS(null, 'stroke-width', strokeWidth);
	}
	g.appendChild(circle);
	return circle
};
RiffShareFlat.prototype.tileRectangle = function (g, x, y, w, h, fillColor, strokeColor, strokeWidth, r) {
	var rect = document.createElementNS(this.svgns, 'rect');
	rect.setAttributeNS(null, 'x', x);
	rect.setAttributeNS(null, 'y', y);
	rect.setAttributeNS(null, 'height', h);
	rect.setAttributeNS(null, 'width', w);
	if (fillColor) {
		rect.setAttributeNS(null, 'fill', fillColor);
	}
	if (strokeColor) {
		rect.setAttributeNS(null, 'stroke', strokeColor);
	}
	if (strokeWidth) {
		rect.setAttributeNS(null, 'stroke-width', strokeWidth);
	}
	if (r) {
		rect.setAttributeNS(null, 'rx', r);
		rect.setAttributeNS(null, 'ry', r);
	}
	g.appendChild(rect);
	return rect;
};
RiffShareFlat.prototype.tileText = function (g, x, y, fontSize, text, bgColor, strokeColor, strokeWidth, fontFamily, fontStyle) {
	var txt = document.createElementNS(this.svgns, 'text');
	txt.setAttributeNS(null, 'x', x);
	txt.setAttributeNS(null, 'y', y);
	txt.setAttributeNS(null, 'font-size', fontSize);
	if (bgColor) {
		txt.setAttributeNS(null, 'fill', bgColor);
	}
	if (fontFamily) {
		txt.setAttributeNS(null, 'font-family', fontFamily);
	}
	if (fontStyle) {
		txt.setAttributeNS(null, 'font-style', fontStyle);
	}
	if (strokeColor) {
		txt.setAttributeNS(null, 'stroke', strokeColor);
	}
	if (strokeWidth) {
		txt.setAttributeNS(null, 'stroke-width', strokeWidth);
	}
	txt.innerHTML = text;
	g.appendChild(txt);
	return txt;
};
RiffShareFlat.prototype.clearLayerChildren = function (layers) {
	for (var i = 0; i < layers.length; i++) {
		var layer = layers[i];
		this.msEdgeHook(layer);
		for (var n = 0; n < layer.children.length; n++) {
			var g = layer.children[n];
			while (g.children.length > 0) {
				g.removeChild(g.children[0]);
			}
		}
	}
};
RiffShareFlat.prototype.makeUndo = function (level) {
	//console.log('makeUndo', level);
	var last = null;
	for (var i = this.undoQueue.length - 1; i >= level; i--) {
		var u = this.undoQueue.pop();
		u.undo();
		last = u;
	}
	if (last) {
		this.resetAllLayersNow();
		this.startSlideTo(last.x, last.y, last.z);
	}
};
RiffShareFlat.prototype.clearUndo = function () {
	this.undoQueue = [];
	this.undoStep = 0;
}
RiffShareFlat.prototype.setUndoStatus = function () {
	if (this.undoStep < this.undoQueue.length) {
		document.getElementById('redoimg').src = "redoActive.png";
	} else {
		document.getElementById('redoimg').src = "redo.png";
	}
	if (this.undoStep > 0) {
		document.getElementById('undoimg').src = "undoActive.png";
	} else {
		document.getElementById('undoimg').src = "undo.png";
	}
};
RiffShareFlat.prototype.redoNext = function () {
	if (this.undoStep < this.undoQueue.length) {
		var a = this.undoQueue[this.undoStep];
		//console.log('redo', a.caption);
		a.redo();
		this.undoStep++;
		this.resetAllLayersNow();
		this.startSlideTo(a.x, a.y, a.z);
		this.setUndoStatus();
	}
};
RiffShareFlat.prototype.undoLast = function () {
	if (this.undoStep > 0) {
		this.undoStep--;
		var a = this.undoQueue[this.undoStep];
		//console.log('undo', a.caption);
		a.undo();
		this.resetAllLayersNow();
		this.startSlideTo(a.x, a.y, a.z);
		this.setUndoStatus();
	}
};
RiffShareFlat.prototype.pushAction = function (action) {
	//console.log('pushAction', action.caption);
	action.x = this.translateX;
	action.y = this.translateY;
	action.z = this.translateZ;
	action.redo();
	var rm = this.undoQueue.length - this.undoStep;
	for (var i = 0; i < rm; i++) {
		this.undoQueue.pop();
	}
	this.undoQueue.push(action);
	this.undoStep++;
	rm = this.undoQueue.length - this.undoSize;
	for (var i = 0; i < rm; i++) {
		this.undoQueue.shift();
		this.undoStep--;
	}
	this.setUndoStatus();
};
RiffShareFlat.prototype.userActionUpTrack = function (order) {
	var before = this.getTrackOrders();
	this.upTrack(order);
	var after = this.getTrackOrders();
	riffshareflat.pushAction({
		caption: 'Up ' + order,
		undo: function () {
			riffshareflat.setTrackOrders(before);
			riffshareflat.mark = null;
		},
		redo: function () {
			riffshareflat.setTrackOrders(after);
			riffshareflat.mark = null;
		}
	});
};
RiffShareFlat.prototype.userActionToneVolume = function (track, volume) {
	var before = this.getTrackOrders();
	this.upTrack(track.order);
	var after = this.getTrackOrders();
	var old = track.volume;
	riffshareflat.pushAction({
		caption: 'Volume ' + volume + ' for ' + track.title,
		undo: function () {
			track.volume = old;
			riffshareflat.setTrackOrders(before);
			riffshareflat.mark = null;
			riffshareflat.resetNodeValues();
		},
		redo: function () {
			track.volume = volume;
			riffshareflat.setTrackOrders(after);
			riffshareflat.mark = null;
			riffshareflat.resetNodeValues();
		}
	});
};
RiffShareFlat.prototype.userActionDrumVolume = function (nn, volume) {
	var old = this.drumVolumes[nn];
	riffshareflat.pushAction({
		caption: 'Volume ' + volume + ' for drum ' + nn,
		undo: function () {
			riffshareflat.drumVolumes[nn] = old;
			riffshareflat.resetNodeValues();
		},
		redo: function () {
			riffshareflat.drumVolumes[nn] = volume;
			riffshareflat.resetNodeValues();
		}
	});
};
RiffShareFlat.prototype.userActionTempo = function (tempo) {
	var old = this.tempo;
	riffshareflat.pushAction({
		caption: '' + tempo,
		undo: function () {
			riffshareflat.tempo = old;
		},
		redo: function () {
			riffshareflat.tempo = tempo;
		}
	});
};
RiffShareFlat.prototype.userActionEqualizer = function (band, volume) {
	var old = this.equalizer[band];
	riffshareflat.pushAction({
		caption: 'Equalizer ' + band + ' = ' + volume,
		undo: function () {
			riffshareflat.equalizer[band] = old;
			riffshareflat.resetNodeValues();
		},
		redo: function () {
			riffshareflat.equalizer[band] = volume;
			riffshareflat.resetNodeValues();
		}
	});
};
RiffShareFlat.prototype.userActionAddDrum = function (beat, drum) {
	riffshareflat.pushAction({
		caption: 'Add drum ' + drum + ' to ' + beat,
		undo: function () {
			riffshareflat.dropDrum(beat, drum);
		},
		redo: function () {
			riffshareflat.setDrum(beat, drum);
		}
	});
};
RiffShareFlat.prototype.userActionDropDrum = function (beat, drum) {
	riffshareflat.pushAction({
		caption: 'Drop drum ' + drum + ' from ' + beat,
		undo: function () {
			riffshareflat.setDrum(beat, drum);
		},
		redo: function () {
			riffshareflat.dropDrum(beat, drum);
		}
	});
};
RiffShareFlat.prototype.userActionAddNote = function (beat, pitch, track, length, shift) {
	riffshareflat.pushAction({
		caption: 'Add note ' + beat + '/' + pitch + '/' + track + '/' + length + '/' + shift,
		undo: function () {
			riffshareflat.dropNote(beat, pitch, track);
		},
		redo: function () {
			riffshareflat.addNote(beat, pitch, track, length, shift);
		}
	});
};
RiffShareFlat.prototype.userActionDropNote = function (beat, pitch, track) {
	var old = this.findNote(beat, pitch, track);
	riffshareflat.pushAction({
		caption: 'Drop note ' + beat + '/' + pitch + '/' + track,
		undo: function () {
			riffshareflat.addNote(old.beat, old.pitch, old.track, old.length, old.shift);
		},
		redo: function () {

			riffshareflat.dropNote(beat, pitch, track);
		}
	});
};
RiffShareFlat.prototype.userActionSwap = function () {
	//console.log(riffshareflat.findTrackInfo(0).title,'<->',riffshareflat.findTrackInfo(1).title);
	var track0 = this.findTrackInfo(0);
	var track1 = this.findTrackInfo(1);
	var old = this.copyTones();
	var nw = this.copyTones();
	for (var i = 0; i < nw.length; i++) {
		if (nw[i].track == track0.nn) {
			nw[i].track = track1.nn;
		} else {
			if (nw[i].track == track1.nn) {
				nw[i].track = track0.nn;
			}
		}
	}
	//console.log(fromN, toN);
	var before = this.getTrackOrders();
	this.upTrack(track1.order);
	var after = this.getTrackOrders();
	riffshareflat.pushAction({
		caption: 'Swap ' + track1.title + ' with ' + track0.title,
		undo: function () {
			riffshareflat.storeTracks = old;
			riffshareflat.setTrackOrders(before);
			riffshareflat.mark = null;
		},
		redo: function () {
			riffshareflat.storeTracks = nw;
			riffshareflat.setTrackOrders(after);
			riffshareflat.mark = null;
		}
	});
};
RiffShareFlat.prototype.userUpInstrument = function () {
	var nn = this.findTrackInfo(0).nn;
	var pre = this.copyTones();
	var after = [];
	for (var i = 0; i < pre.length; i++) {
		if (pre[i].pitch >= 12 * 4 && nn == pre[i].track) {
			return;
		}
		if (nn == pre[i].track) {
			after.push({
				beat: pre[i].beat,
				pitch: pre[i].pitch + 12,
				track: pre[i].track,
				shift: pre[i].shift,
				length: pre[i].length
			});
		} else {
			after.push({
				beat: pre[i].beat,
				pitch: pre[i].pitch,
				track: pre[i].track,
				shift: pre[i].shift,
				length: pre[i].length
			});
		}

	}
	riffshareflat.pushAction({
		caption: 'up instrument ' + nn,
		undo: function () {
			riffshareflat.storeTracks = pre;
		},
		redo: function () {
			riffshareflat.storeTracks = after;
		}
	});
};
RiffShareFlat.prototype.userDownInstrument = function () {
	var nn = this.findTrackInfo(0).nn;
	var pre = this.copyTones();
	var after = [];
	for (var i = 0; i < pre.length; i++) {
		if (pre[i].pitch < 12 && nn == pre[i].track) {
			return;
		}
		if (nn == pre[i].track) {
			after.push({
				beat: pre[i].beat,
				pitch: pre[i].pitch - 12,
				track: pre[i].track,
				shift: pre[i].shift,
				length: pre[i].length
			});
		} else {
			after.push({
				beat: pre[i].beat,
				pitch: pre[i].pitch,
				track: pre[i].track,
				shift: pre[i].shift,
				length: pre[i].length
			});
		}

	}
	riffshareflat.pushAction({
		caption: 'down instrument ' + nn,
		undo: function () {
			riffshareflat.storeTracks = pre;
		},
		redo: function () {
			riffshareflat.storeTracks = after;
		}
	});
};
RiffShareFlat.prototype.userClearDrumMeasure = function (msr) {
	var pre = this.copyDrums();
	var after = [];
	var c16 = 16 * this.cauntDrumMeasures();
	for (var i = 0; i < pre.length; i++) {
		if (pre[i].beat >= msr * 16 && pre[i].beat < (1 + msr) * 16) {
			//
		} else {
			after.push({
				beat: pre[i].beat,
				drum: pre[i].drum
			});
		}
	}
	riffshareflat.pushAction({
		caption: 'clear drum measure ' + msr,
		undo: function () {
			riffshareflat.storeDrums = pre;
		},
		redo: function () {
			riffshareflat.storeDrums = after;
		}
	});
};
RiffShareFlat.prototype.userClearMeasure = function (msr) {
	var nn = this.findTrackInfo(0).nn;
	var pre = this.copyTones();
	var after = [];
	for (var i = 0; i < pre.length; i++) {
		if (pre[i].beat >= msr * 16 && pre[i].beat < (1 + msr) * 16 && nn == pre[i].track) {
			//
		} else {
			after.push({
				beat: pre[i].beat,
				pitch: pre[i].pitch,
				track: pre[i].track,
				shift: pre[i].shift,
				length: pre[i].length
			});
		}
	}
	riffshareflat.pushAction({
		caption: 'clear measure ' + msr + ' for instrument ' + nn,
		undo: function () {
			riffshareflat.storeTracks = pre;
		},
		redo: function () {
			riffshareflat.storeTracks = after;
		}
	});
};
RiffShareFlat.prototype.userUpMeasure = function (msr) {
	var nn = this.findTrackInfo(0).nn;
	var pre = this.copyTones();
	var after = [];
	for (var i = 0; i < pre.length; i++) {
		if (pre[i].beat >= msr * 16 && pre[i].beat < (1 + msr) * 16 && nn == pre[i].track) {
			if (pre[i].pitch >= 12 * 5 - 1) {
				return;
			}
			after.push({
				beat: pre[i].beat,
				pitch: pre[i].pitch + 1,
				track: pre[i].track,
				shift: pre[i].shift,
				length: pre[i].length
			});
		} else {
			after.push({
				beat: pre[i].beat,
				pitch: pre[i].pitch,
				track: pre[i].track,
				shift: pre[i].shift,
				length: pre[i].length
			});
		}
	}
	riffshareflat.pushAction({
		caption: 'up measure ' + msr + ' for instrument ' + nn,
		undo: function () {
			riffshareflat.storeTracks = pre;
		},
		redo: function () {
			riffshareflat.storeTracks = after;
		}
	});
};
RiffShareFlat.prototype.userDownMeasure = function (msr) {
	var nn = this.findTrackInfo(0).nn;
	var pre = this.copyTones();
	var after = [];
	for (var i = 0; i < pre.length; i++) {
		if (pre[i].beat >= msr * 16 && pre[i].beat < (1 + msr) * 16 && nn == pre[i].track) {
			if (pre[i].pitch < 1) {
				return;
			}
			after.push({
				beat: pre[i].beat,
				pitch: pre[i].pitch - 1,
				track: pre[i].track,
				shift: pre[i].shift,
				length: pre[i].length
			});
		} else {
			after.push({
				beat: pre[i].beat,
				pitch: pre[i].pitch,
				track: pre[i].track,
				shift: pre[i].shift,
				length: pre[i].length
			});
		}
	}
	riffshareflat.pushAction({
		caption: 'down measure ' + msr + ' for instrument ' + nn,
		undo: function () {
			riffshareflat.storeTracks = pre;
		},
		redo: function () {
			riffshareflat.storeTracks = after;
		}
	});
};

RiffShareFlat.prototype.userClearInstrument = function () {
	var nn = this.findTrackInfo(0).nn;
	var pre = this.copyTones();
	var after = [];
	for (var i = 0; i < pre.length; i++) {
		if (nn == pre[i].track) {
			//
		} else {
			after.push({
				beat: pre[i].beat,
				pitch: pre[i].pitch,
				track: pre[i].track,
				shift: pre[i].shift,
				length: pre[i].length
			});
		}
	}
	riffshareflat.pushAction({
		caption: 'clear instrument ' + nn,
		undo: function () {
			riffshareflat.storeTracks = pre;
		},
		redo: function () {
			riffshareflat.storeTracks = after;
		}
	});
};
RiffShareFlat.prototype.userClearDrum = function () {
	var pre = this.copyDrums();
	var after = [];
	riffshareflat.pushAction({
		caption: 'clear drums',
		undo: function () {
			riffshareflat.storeDrums = pre;
		},
		redo: function () {
			riffshareflat.storeDrums = after;
		}
	});
};
RiffShareFlat.prototype.userRepeatInstrument = function () {
	var nn = this.findTrackInfo(0).nn;
	var pre = this.copyTones();
	var after = this.copyTones();
	var c16 = 16 * this.cauntToneMeasures(nn);
	for (var i = 0; i < pre.length; i++) {
		if (nn == pre[i].track && pre[i].beat + c16 < 16 * 16) {
			after.push({
				beat: pre[i].beat + c16,
				pitch: pre[i].pitch,
				track: pre[i].track,
				shift: pre[i].shift,
				length: pre[i].length
			});
		}
	}
	riffshareflat.pushAction({
		caption: 'repeat instrument ' + nn,
		undo: function () {
			riffshareflat.storeTracks = pre;
		},
		redo: function () {
			riffshareflat.storeTracks = after;
		}
	});
};
RiffShareFlat.prototype.userRepeatDrums = function () {
	var pre = this.copyDrums();
	var after = this.copyDrums();
	var c16 = 16 * this.cauntDrumMeasures();
	for (var i = 0; i < pre.length; i++) {
		if (pre[i].beat + c16 < 16 * 16) {
			after.push({
				beat: pre[i].beat + c16,
				drum: pre[i].drum
			});
		}
	}
	riffshareflat.pushAction({
		caption: 'repeat drums',
		undo: function () {
			riffshareflat.storeDrums = pre;
		},
		redo: function () {
			riffshareflat.storeDrums = after;
		}
	});
};

RiffShareFlat.prototype.userActionClearAll = function () {
	this.saveState();
	addStateToHistory();
	var d = this.copyDrums();
	var t = this.copyTones();
	riffshareflat.pushAction({
		caption: 'Clear all',
		undo: function () {
			riffshareflat.storeDrums = d;
			riffshareflat.storeTracks = t;
			riffshareflat.mark = null;
		},
		redo: function () {
			riffshareflat.storeDrums = [];
			riffshareflat.storeTracks = [];
			riffshareflat.mark = null;
		}
	});
};
RiffShareFlat.prototype.userActionChangeScheme = function (nn) {
	var olds = this.bgMode;
	var news = nn;
	riffshareflat.pushAction({
		caption: 'Change background mode ' + nn,
		undo: function () {
			riffshareflat.setModeBackground(olds)
		},
		redo: function () {
			riffshareflat.setModeBackground(news)
		}
	});
};
RiffShareFlat.prototype.userActionReplaceDrum = function (drmNum, smplNum) {
	var me = this;
	var smplOld = this.drumInfo[drmNum].replacement;
	riffshareflat.pushAction({
		caption: 'Replace drum ' + smplNum,
		undo: function () {
			this.drumInfo[drmNum].replacement = smplOld;
			if (smplOld) {
				this.drumInfo[drmNum].info = me.player.loader.drumInfo(smplOld - 1);
			} else {
				this.drumInfo[drmNum].info = null;
			}
		},
		redo: function () {
			this.drumInfo[drmNum].replacement = smplNum;
			if (smplNum) {
				this.drumInfo[drmNum].info = me.player.loader.drumInfo(smplNum - 1);
			} else {
				this.drumInfo[drmNum].info = null;
			}
		}
	});
};
RiffShareFlat.prototype.userActionReplaceIns = function (insNum, smplNum) {
	var me = this;
	var smplOld = this.trackInfo[insNum].replacement;
	riffshareflat.pushAction({
		caption: 'Replace instrument ' + smplNum,
		undo: function () {
			this.trackInfo[insNum].replacement = smplOld;
			if (smplOld) {
				this.trackInfo[insNum].info = me.player.loader.instrumentInfo(smplOld - 1);
			} else {
				this.trackInfo[insNum].info = null;
			}
		},
		redo: function () {
			this.trackInfo[insNum].replacement = smplNum;
			if (smplNum) {
				this.trackInfo[insNum].info = me.player.loader.instrumentInfo(smplNum - 1);
			} else {
				this.trackInfo[insNum].info = null;
			}
		}
	});
};
RiffShareFlat.prototype.midiNoteOn = function (pitch) {
	this.midiNoteOff(pitch);
	var channel = this.trackInfo[0];
	for (var i = 0; i < this.trackInfo.length; i++) {
		channel = this.trackInfo[i];
		if (this.trackInfo[i].order == 0) {
			break;
		}
	}
	this.midiKeys[pitch] = this.player.queueWaveTable(this.audioContext, channel.audioNode, channel.sound, 0, pitch, 10, channel.volumeRatio);
};
RiffShareFlat.prototype.midiNoteOff = function (pitch) {
	if (this.midiKeys[pitch]) {
		this.midiKeys[pitch].cancel();
	}
};

function loadFromString(riff) {
	console.log('riff', riff);
	addStateToHistory();
	saveObject2localStorage('storeDrums', []);
	saveObject2localStorage('storeTracks', []);
	decodeState(riff);
	//window.location = "https://vk.com/app7562667_95994542/";

	//document.getElementById('openmsg').innerHTML = 'Открыть мелодию в музыкальном редакторе';
	//window.scrollTo(0, 0);
	riffshareflat.loadState();
	switchEdit();
}

function loadFromURL() {
	//var riff = getUrlVars()['riff'];
	var riff = window.location.hash.substr(1);
	//console.log('location.href', location.href);
	
	if (riff) {
		if (riff.length > 55) {
			loadFromString(riff);
			return true;
		}
	}
	return false;
}
//https://surikov.github.io/RiffShareAndroid/app/src/main/assets/load.html?riff=78-00000055-50806070-0d0c0b10080b0d0e070c-000301fe030e048305ff060107564010411142114311441145114611471180fe81ff82fe83ff84fe85ff86fe87ffc00fc7ee-006021d40007020540046022040047020540076021d40077020340096021d400970203400a60222400a70200400c6021d400c70200400e6021b400e7020340106021d40107020540146022440147020540176021d40196021d401970200401a60225401a70200401c60224401c70203401e60220401e7020540206021d40207020140226022440246022940247020140266021d40276021b40277020340296021b402970203402a60218402a70200402c6021f402c70203402e60b1d402e70205403070205403970203403a70200403c7020a403e7020840
//https://vk.com/app7562667_95994542#78-00000055-50806070-0d0c0b10080b0d0e070c-000301fe030e048305ff060107564010411142114311441145114611471180fe81ff82fe83ff84fe85ff86fe87ffc00fc7ee-006021d40007020540046022040047020540076021d40077020340096021d400970203400a60222400a70200400c6021d400c70200400e6021b400e7020340106021d40107020540146022440147020540176021d40196021d401970200401a60225401a70200401c60224401c70203401e60220401e7020540206021d40207020140226022440246022940247020140266021d40276021b40277020340296021b402970203402a60218402a70200402c6021f402c70203402e60b1d402e70205403070205403970203403a70200403c7020a403e7020840		
//file:///C:/sss/GitHub/vkmuzon/vk-muzon/index.html?one=second#78-00000055-50806070-0d0c0b10080b0d0e070c-000301fe030e048305ff060107564010411142114311441145114611471180fe81ff82fe83ff84fe85ff86fe87ffc00fc7ee-006021d40007020540046022040047020540076021d40077020340096021d400970203400a60222400a70200400c6021d400c70200400e6021b400e7020340106021d40107020540146022440147020540176021d40196021d401970200401a60225401a70200401c60224401c70203401e60220401e7020540206021d40207020140226022440246022940247020140266021d40276021b40277020340296021b402970203402a60218402a70200402c6021f402c70203402e60b1d402e70205403070205403970203403a70200403c7020a403e7020840		

function promptFile() {
	//console.log('promptFile');
	document.getElementById("filesOpen").click();
}

function adjustPitch(pitch) {
	var p = 1 * pitch - 12 * 3;
	if (p < 0) {
		while (p < 0) {
			p = p + 12;
		}
	}
	if (p >= 5 * 12) {
		while (p >= 5 * 12) {
			p = p - 12;
		}
	}
	return p;
}

function noDrum(drums, d, b) {
	for (var i = 0; i < drums.length; i++) {
		if (drums[i].drum == d && drums[i].beat == b) {
			return false;
		}
	}
	return true;
}

function noTone(tones, t, b, p) {
	//console.log(tones);
	for (var i = 0; i < tones.length; i++) { //console.log(tones,t,b,p);
		if (tones[i].track == t && tones[i].beat == b && tones[i].pitch == p) {
			return false;
		}
	}
	return true;
}

function openSong(evt) {
	console.log("openSong v2", evt);
	//console.log(encodeState());
	var skp = 0; //1 * document.getElementById("skip16").value;

	var fileList = evt.target.files;
	if (fileList.length > 0) {
		var file = fileList.item(0);
		var fileReader = new FileReader();
		fileReader.onload = function (progressEvent) {
			//console.log(progressEvent);
			if (progressEvent.target.readyState == FileReader.DONE) {
				var arrayBuffer = progressEvent.target.result;
				var midiFile = new MIDIFile(arrayBuffer);
				//console.log(midiFile);

				var song = midiFile.parseSong();
				//console.log(song);
				//console.log(midiFile.header.getTicksPerBeat());
				//console.log(midiFile.header.getTimeDivision());
				//console.log(midiFile.header.getSMPTEFrames());
				//console.log(midiFile.header.getTicksPerFrame());
				//console.log(midiFile.header.setSMTPEDivision());
				//console.log(midiFile.header.getTicksPerBeat(),':',midiFile.header.getTimeDivision());
				var ticksPerBeat = 480; //midiFile.header.getTicksPerBeat();
				//console.log('ticksPerBeat', ticksPerBeat);
				if (midiFile.header.getTimeDivision() === MIDIFile.Header.TICKS_PER_BEAT) {
					ticksPerBeat = midiFile.header.getTicksPerBeat();
					console.log('now ticksPerBeat', ticksPerBeat);
				}

				/*if(midiFile.header.getTimeDivision() === MIDIFile.Header.TICKS_PER_BEAT) {
					console.log(midiFile.header.getTicksPerBeat());
				} else {
					console.log(midiFile.header.getSMPTEFrames());
					console.log(midiFile.header.getTicksPerFrame());
				}*/
				addStateToHistory();
				saveObject2localStorage('storeDrums', []);
				saveObject2localStorage('storeTracks', []);

				var storeTracks = []; //sureArray(readObjectFromlocalStorage('storeTracks'), []);
				for (var t = 0; t < song.tracks.length; t++) {
					var track = song.tracks[t];
					var ins = 4;
					if (track.program + 1 == 31) {
						ins = 0;
					}
					if (track.program + 1 >= 25 && track.program + 1 <= 28) {
						ins = 1;
					}
					if (track.program + 1 >= 17 && track.program + 1 <= 24) {
						ins = 2;
					}
					if (track.program + 1 == 30) {
						ins = 3;
					}
					if (track.program + 1 >= 33 && track.program + 1 <= 38) {
						ins = 5;
					}
					if (track.program + 1 >= 41 && track.program + 1 <= 88) {
						ins = 6;
					}
					if (track.program + 1 >= 39 && track.program + 1 <= 40) {
						ins = 7;
					}
					for (var n = 0; n < track.notes.length; n++) {
						var note = track.notes[n];
						var beat = Math.round(4 * note.tick / ticksPerBeat);
						if (beat >= skp && beat < skp + 256) {
							if (noTone(storeTracks, ins, beat - skp, adjustPitch(note.pitch))) {
								storeTracks.push({
									track: ins,
									beat: beat - skp,
									pitch: adjustPitch(note.pitch),
									length: Math.round(4 * note.tickDuration / ticksPerBeat),
									shift: 0
								});
							}
						}
					}
				}
				saveObject2localStorage('storeTracks', storeTracks);
				//console.log('storeTracks', storeTracks)
				var storeDrums = []; //sureArray(readObjectFromlocalStorage('storeDrums'), []);
				for (var t = 0; t < song.beats.length; t++) {
					var track = song.beats[t];
					var ins = 6;
					if (track.n >= 35 && track.n <= 36) {
						ins = 0;
					}
					if (track.n == 41 || track.n == 43) {
						ins = 1;
					}
					if (track.n == 38 || track.n == 40) {
						ins = 2;
					}
					if (track.n == 45 || track.n == 47 || track.n == 48 || track.n == 50) {
						ins = 3;
					}
					if (track.n == 42 || track.n == 44) {
						ins = 4;
					}
					if (track.n == 46) {
						ins = 5;
					}
					if (track.n == 49) {
						ins = 7;
					}
					for (var n = 0; n < track.notes.length; n++) {
						var note = track.notes[n];
						var beat = Math.round(4 * note.tick / ticksPerBeat);
						if (beat >= skp && beat < skp + 256) {
							if (noDrum(storeDrums, n, beat - skp)) {
								storeDrums.push({
									drum: ins,
									beat: beat - skp
								});
							}
						}
					}
				}
				saveObject2localStorage('storeDrums', storeDrums);
				//console.log('storeDrums', storeDrums)
				//disableSaveState = true;
				//window.location='index.html';
				//window.location = "https://vk.com/app7562667_95994542/";
				//window.scrollTo(0, 0);
				switchEdit();
				/*
				var midiParser = new MidiParser(arrayBuffer);
				midiParser.parse();
				console.log('slice from',skp);
				//storeDrums=[];
				var storeDrums = sureArray(readObjectFromlocalStorage('storeDrums'), []);
				for(var b=skp;b<midiParser.songBeatSteps.length;b++){
					if(b>(skp+255))break;
					var beat=midiParser.songBeatSteps[b];
					for(var c=0;c<beat.length;c++){
						var n=6;
						if(beat[c]>=35 && beat[c]<=36){n=0;}
						if(beat[c]==41 || beat[c]==43){n=1;}
						if(beat[c]==38 || beat[c]==40){n=2;}
						if(beat[c]==45 || beat[c]==47 || beat[c]==48 || beat[c]==50){n=3;}
						if(beat[c]==42 || beat[c]==44){n=4;}
						if(beat[c]==46){n=5;}
						if(beat[c]==49){n=7;}
						if(noDrum(storeDrums,n,b-skp)){
							storeDrums.push({drum:n,beat:b-skp});
						}
					}
				}
				saveObject2localStorage('storeDrums',storeDrums);
				//storeTracks=[];
				var storeTracks = sureArray(readObjectFromlocalStorage('storeTracks'), []);
				for(var b=skp;b<midiParser.songTuneSteps.length;b++){
					if(b>(skp+255))break;
					var beat=midiParser.songTuneSteps[b];
					for(var c=0;c<beat.length;c++){
						var note=beat[c];
						var n=4;
						if(beat[c].instrument+1==31){n=0;}
						if(beat[c].instrument+1>=25 && beat[c].instrument+1<=28){n=1;}
						if(beat[c].instrument+1>=17 && beat[c].instrument+1<=24){n=2;}
						if(beat[c].instrument+1==30){n=3;}
						//
						if(beat[c].instrument+1>=33 && beat[c].instrument+1<=38){n=5;}
						if(beat[c].instrument+1>=41 && beat[c].instrument+1<=88){n=6;}
						if(beat[c].instrument+1>=39 && beat[c].instrument+1<=40){n=7;}
						var u=1*note.length;//-1;
						if(u<1)u=1;
						//console.log(note.length,{track:n,beat:b-skp,pitch:adjustPitch(note.pitch),length:u,shift:note.glissando});
						if(noTone(storeTracks,n,b-skp,adjustPitch(note.pitch))){
							storeTracks.push({track:n,beat:b-skp,pitch:adjustPitch(note.pitch),length:u,shift:note.glissando});
						}
					}
				}
				saveObject2localStorage('storeTracks',storeTracks);
				window.location='index.html';
				*/
			} else {
				//console.log(progressEvent.target.readyState);
			}
		};
		fileReader.readAsArrayBuffer(file);
	}
}