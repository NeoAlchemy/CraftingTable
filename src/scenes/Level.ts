
// You can write more code here

/* START OF COMPILED CODE */

import Phaser from "phaser";
/* START-USER-IMPORTS */
import GameMechanism from "../utils/game_mechanisms";
/* END-USER-IMPORTS */

export default class Level extends Phaser.Scene {

	constructor() {
		super("Level");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {

		// minecraft_background
		const minecraft_background = this.add.image(399, 303, "minecraft_background");
		minecraft_background.scaleX = 1.1919027377667641;
		minecraft_background.scaleY = 1.7218664581437901;

		// GameBorder
		const gameBorder = this.add.rectangle(390, 290, 333, 333);
		gameBorder.isFilled = true;
		gameBorder.fillColor = 6371103;
		gameBorder.isStroked = true;
		gameBorder.strokeColor = 6371103;
		gameBorder.lineWidth = 10;

		// GameTitle
		const gameTitle = this.add.text(146, 4, "", {});
		gameTitle.text = "Crafting Table";
		gameTitle.setStyle({ "color": "#000", "fontSize": "60px", "fontStyle": "bold" });

		// ScoreLabel
		const scoreLabel = this.add.text(220, 82, "", {});
		scoreLabel.text = "Score:";
		scoreLabel.setStyle({ "color": "#000", "fontFamily": "Verdana", "fontSize": "32px" });

		// score
		const score = this.add.text(330, 83, "", {});
		score.text = "0";
		score.setStyle({ "color": "#000", "fontFamily": "Verdana", "fontSize": "32px" });

		this.minecraft_background = minecraft_background;
		this.gameBorder = gameBorder;
		this.score = score;

		this.events.emit("scene-awake");
	}

	private minecraft_background!: Phaser.GameObjects.Image;
	private gameBorder!: Phaser.GameObjects.Rectangle;
	private score!: Phaser.GameObjects.Text;

	/* START-USER-CODE */

	// Write your code here
	private arena: Array<Array<Phaser.GameObjects.Image|null>> = [];
	private startTop: number = 150;
	private startLeft: number = 250;
	private interval: number = 40;
	private originTile?: Phaser.GameObjects.Image;
	private originArenaPoint?: any;
	private dropTile?: Phaser.GameObjects.Image;
	private selection?: any;
	private totalScore: number = 0;

	create() {

		this.editorCreate();

		this.createGrid();		

		this.removeMatches();

		this.input.on("pointerdown", this.selectTile, this);


	}

	update() {
		if (this.isEmptySpots()) {
			this.refillArena()
		} else {
		
			this.removeMatches();
		}
		
	}



	createGrid() {
		this.arena = []
		for (let row = 0; row < GameMechanism.MAX_GRID_ROWS; row++) {
			let tileRow: Array<Phaser.GameObjects.Image|null> = [];
			for (let col = 0; col < GameMechanism.MAX_GRID_COLUMNS; col++) {
				let tile: Phaser.GameObjects.Image = this.addImageInArena(col, row);
				tileRow.push(tile)
			}
			this.arena.push(tileRow)
		}
	}

	walkArena(callback: Function) {
		for (let row = 0; row < GameMechanism.MAX_GRID_ROWS; row++) {
			for (let col = 0; col < GameMechanism.MAX_GRID_COLUMNS; col++) {
				callback(col, row);
			}
		}
	}

	getRandomTile() {
		let tileKeys = ["brickblock", "crateblock", "goldblock", "grassblock", "surpriseblock"]
		var rand = (new Phaser.Math.RandomDataGenerator).between(0, 4);
		return tileKeys[rand];
	}

	isEmptySpots(): boolean {
		let isEmpty = false;
		this.walkArena((row: number, col: number) => {
			let image = this.arena[row][col];
			// if there is no image
			if (!image) {
				isEmpty = true;
			} else if (!image.active) {
				this.arena[row][col] = null;
				isEmpty = true;
			}
		});	  
		return isEmpty;
	}

	isMatches(): boolean {
		let isMatches = false;
		this.walkArena((row: number, col: number) => {
			let horizontalMatches =  this.checkHorizontalMatch(row, col);
			let verticalMatches =  this.checkVerticalMatch(row, col);
			// if there is no image
			if (horizontalMatches || verticalMatches) {
				isMatches = true;
			}
		});	  
		return isMatches;
	}

	removeMatches() {
		// loop through arena
		this.walkArena((row: number, col: number) => {
			let horizontalMatches =  this.checkHorizontalMatch(row, col);
			setTimeout(()=>{
				if (horizontalMatches && horizontalMatches.imageH1 && horizontalMatches.imageH2 && horizontalMatches.imageH3) {
					horizontalMatches.imageH1.destroy();
					horizontalMatches.imageH2.destroy();
					horizontalMatches.imageH3.destroy();	
					this.incrementScore();
				}
			}, 0);

			let verticalMatches =  this.checkVerticalMatch(row, col);
			setTimeout(()=>{
				if (verticalMatches && verticalMatches.imageV1 && verticalMatches.imageV2 && verticalMatches.imageV3) {
					verticalMatches.imageV1.destroy();
					verticalMatches.imageV2.destroy();
					verticalMatches.imageV3.destroy();	
					this.incrementScore();
				}
			}, 0);
		})
	}

	refillArena() {
		this.walkArena((row: number, col: number) => {
			let image = this.arena[row][col];
			// if there is no image
			if (!image || !image.active) {
				// if there is a row above and an image there
				// let aboveTile: any = this.getAboveActiveTile(row, col);
				let aboveTile = (row != 0) ? this.arena[row - 1][col] : null;
				if (aboveTile && aboveTile.active) {
					var tweenStart: number = this.startTop + ((row-1) * this.interval)
					var tweenEnd: number = this.startTop + (row * this.interval)
					var tween = this.tweens.add({
						targets: [aboveTile],
						onStart: (tween, target, aboveTile: any) => {
							
						},
						onStartParams: [aboveTile],
						y: { from: tweenStart, to: tweenEnd },
						ease: 'Bounce',
						duration: GameMechanism.ANIMATION_DURATION,
						onComplete: (tween, target, aboveTile: Phaser.GameObjects.Image, row: number, col: number) => {
							this.arena[row - 1][col] = null	
							this.arena[row][col] =  aboveTile;
						},
						onCompleteScope: this,
						onCompleteParams: [aboveTile, row, col]
					});
				} else if (row == 0) {
					setTimeout(() => {
						if (!image || !image.active) {
							let activeImageHere: Phaser.GameObjects.Image | null = this.getActiveImageHere(col, row);
							if (!activeImageHere) {
								let tile: Phaser.GameObjects.Image = this.addImageInArena(col, row)
								this.arena[row][col] = tile;
							}
							this.arena[row][col] = activeImageHere;
						} else {
							console.log("is this possible??")
						}
					}, 300);
				}
			}
		})
	}

	getAboveActiveTile(row: number, col: number): any {
		for (let i = row; i > 0; i--) {
			var aboveTile = this.arena[i][col];
			if (aboveTile && aboveTile.active) {
				return { tile: aboveTile, row: i, col: col};
			} 
		}
		return null;
	}

	checkHorizontalMatch(row: number, col: number): any {
		let imageH1 = this.arena[row][col];
		if (imageH1) {
			let startingImageText: string = imageH1.texture.key
			// any three in a row horizontally or vertically?
			if (col+2 < GameMechanism.MAX_GRID_COLUMNS) {
				let imageH2 = this.arena[row][col+1]
				let imageH3 = this.arena[row][col+2]
				// if able to check vertically 3 for matches
				if (imageH2 && imageH3 &&
					startingImageText == imageH2.texture.key && 
					startingImageText == imageH3.texture.key) {
					return { imageH1, imageH2, imageH3 }
				}
			}
		}
		return null;
	}

	checkVerticalMatch(row: number, col: number): any {
		let imageV1 = this.arena[row][col];
		if (imageV1) {
			let startingImageText: string = imageV1.texture.key
			// any three in a row horizontally or vertically?
			if (row+2 < GameMechanism.MAX_GRID_ROWS) {
				// if able to check next 3 for matches
				let imageV2 = this.arena[row+1][col]
				let imageV3 = this.arena[row+2][col]
				if (imageV2 && imageV3 &&
					startingImageText == imageV2.texture.key &&
					startingImageText == imageV3.texture.key) {
					return { imageV1, imageV2, imageV3 }
				}
			}
		}
		return null;
	};

	addImageInArena(col: number, row: number, texture?: string): Phaser.GameObjects.Image {
		if (!texture) {
			texture = this.getRandomTile()
		}
		let x: number = this.startLeft + (col * this.interval);
		let y: number = this.startTop + (row * this.interval);
		let tile = this.add.image(x, y, texture);
		tile.scale = 0.25;
		tile.depth = 100;
		tile.setInteractive({draggable: true, dropZone: true});
		return tile;	
	}

	convertWorldXYtoArenaPoint(x: number, y: number): { row: number, col: number } {
		let row = Math.round((y - this.startTop) / this.interval);
		let col = Math.round((x - this.startLeft) / this.interval);
		return { row, col };
	}

	getActiveImageHere(col: number, row: number): Phaser.GameObjects.Image | null {
		let x: number = this.startLeft + (col * this.interval);
		let y: number = this.startTop + (row * this.interval);
		let activeImage: Phaser.GameObjects.Image | null  = null;
		if (this.children) {
			let childrenList: any = this.children.getChildren();
			for (let i=0; i<childrenList.length; i++) {
				if (childrenList[i] && childrenList[i].type == "Image") {
					let tile: Phaser.GameObjects.Image = childrenList[i];
					if (tile.x == x && tile.y == y && tile.active) {
						activeImage = tile;
					}
				}
			}
		}
		return activeImage
	}


	selectTile(pointerEvent: any) {
		var selectedTileArenaPoint = this.convertWorldXYtoArenaPoint(pointerEvent.worldX, pointerEvent.worldY)
		if (this.arena[selectedTileArenaPoint.row]) {
			let selectedTile = this.arena[selectedTileArenaPoint.row][selectedTileArenaPoint.col];
			if (selectedTile) {
				if (!this.originTile) {
					console.log("selection: " + selectedTile.texture.key + "row: " + selectedTileArenaPoint.row + "col: " + selectedTileArenaPoint.col);
					this.originArenaPoint = selectedTileArenaPoint;
					this.originTile = selectedTile;
					this.addSelection(selectedTile);
				} else {
					if ((selectedTileArenaPoint.col == this.originArenaPoint.col && selectedTileArenaPoint.row == this.originArenaPoint.row + 1) ||
						(selectedTileArenaPoint.col == this.originArenaPoint.col && selectedTileArenaPoint.row == this.originArenaPoint.row - 1) ||
						(selectedTileArenaPoint.row == this.originArenaPoint.row && selectedTileArenaPoint.col == this.originArenaPoint.col + 1) ||
						(selectedTileArenaPoint.row == this.originArenaPoint.row && selectedTileArenaPoint.col == this.originArenaPoint.col - 1)) {	
						this.dropTile = selectedTile;
						this.selection.destroy();
						console.log(this.originTile.texture.key + " switching with " + this.dropTile.texture.key);
						this.switchTiles(this.originTile, this.dropTile);
						this.originTile = undefined;
					} else {
						this.addSelection(selectedTile);
						this.originArenaPoint = selectedTileArenaPoint;
						this.originTile = selectedTile;
					}

				}
			}	
		}		
	}	

	switchPhysicalTiles(originTile: Phaser.GameObjects.Image, targetTile: Phaser.GameObjects.Image) {
		// move horizontally
		if (originTile.x != targetTile.x) {
			// origin on right
			if (originTile.x > targetTile.x) {
				var tween = this.tweens.add({
					targets: [targetTile],
					x: { from: targetTile.x, to: targetTile.x + this.interval },
					ease: 'Bounce',
					duration: GameMechanism.ANIMATION_DURATION,
					onComplete: this.switchReferenceTiles,
					onCompleteScope: this,
					onCompleteParams: [originTile, targetTile]
				});
				originTile.x = targetTile.x
			// origin on left
			} else {
				var tween = this.tweens.add({
					targets: [targetTile],
					x: { from: targetTile.x, to: targetTile.x - this.interval },
					ease: 'Bounce',
					duration: GameMechanism.ANIMATION_DURATION,
					onComplete: this.switchReferenceTiles,
					onCompleteScope: this,
					onCompleteParams: [originTile, targetTile]
				});
				originTile.x = targetTile.x
			}
		// move vertically
		} else if (originTile.y != targetTile.y) {
			// origin on bottom
			if (originTile.y > targetTile.y) {
				var tween = this.tweens.add({
					targets: [targetTile],
					y: { from: targetTile.y, to: targetTile.y + this.interval },
					ease: 'Bounce',
					duration: GameMechanism.ANIMATION_DURATION,
					onComplete: this.switchReferenceTiles,
					onCompleteScope: this,
					onCompleteParams: [originTile, targetTile]
				});
				originTile.y = targetTile.y
			// origin on above
			} else {
				var tween = this.tweens.add({
					targets: [targetTile],
					y: { from: targetTile.y, to: targetTile.y - this.interval },
					ease: 'Bounce',
					duration: GameMechanism.ANIMATION_DURATION,
					onComplete: this.switchReferenceTiles,
					onCompleteScope: this,
					onCompleteParams: [originTile, targetTile]
				});
				originTile.y = targetTile.y
			}
		}

	}

	switchReferenceTiles(tween: any, target: any, originTile: Phaser.GameObjects.Image, targetTile: Phaser.GameObjects.Image) {
		let originArenaPoint = this.convertWorldXYtoArenaPoint(originTile.x, originTile.y);
		if (this.arena[originArenaPoint.row]) this.arena[originArenaPoint.row][originArenaPoint.col] = originTile;

		let targetArenaPoint = this.convertWorldXYtoArenaPoint(targetTile.x, targetTile.y);
		if (this.arena[targetArenaPoint.row]) this.arena[targetArenaPoint.row][targetArenaPoint.col] = targetTile;
	}

	switchTilesBack(originTile: Phaser.GameObjects.Image, targetTile: Phaser.GameObjects.Image) {
		this.switchPhysicalTiles(originTile, targetTile);
	}

	switchTiles(originTile: Phaser.GameObjects.Image, targetTile: Phaser.GameObjects.Image) {
		this.switchPhysicalTiles(originTile, targetTile);

		setTimeout(() => {
			if (originTile.active && targetTile.active && !this.isMatches()) {
				this.switchTilesBack(originTile, targetTile)	
			}

		}, GameMechanism.ANIMATION_DURATION + 100);

	}

	addSelection(tile: Phaser.GameObjects.Image) {
		if (this.selection) this.selection.destroy();
		this.selection = this.add.graphics();
		this.selection.lineStyle(2, 0xffffff);
		this.selection.strokeRect(tile.x - this.interval/2, tile.y - this.interval/2, this.interval, this.interval)
	}

	incrementScore() {
		this.totalScore += 100;
		this.score.text = String(this.totalScore)
	}

	printArena() {
		var rowString = "";
		for (let row = 0; row < GameMechanism.MAX_GRID_ROWS; row++) {
			for (let col = 0; col < GameMechanism.MAX_GRID_COLUMNS; col++) {
				if (this.arena[row]) {
					let tile = this.arena[row][col]
					if (tile) {
						rowString += "[" + tile.texture.key + "] "
					} else {
						rowString += "[ ] "
					}
				}
			}
			console.log(rowString)
			rowString = "";
		}
	}


	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
