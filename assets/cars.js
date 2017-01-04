const list = {
	ambulance: 'Ambulance',
	audi: 'Audi',
	viper: 'Black_viper',
	car: 'Car',
	truck: 'Mini_truck',
	van: 'Mini_van',
	taxi: 'taxi.png',
	police: 'Police.png'
};

Object.keys(list).forEach(elm => {
	list[elm] += '.png';
});

function loadSprites(game) {
	list.forEach(elm => {
		game.load.image(elm, `assets/${list[elm]}`);
	});
}

function randomCar() {
	const keys = Object.keys(list);
	const index = Math.floor(Math.random() * keys.length);
	return list[index];
}

export {loadSprites, randomCar};
