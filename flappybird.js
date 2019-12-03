// JAVASCRIPT CODE //
//variables and constants
const myCanvas=document.getElementById("windowGame");
const context=myCanvas.getContext("2d");
let frames=0;
const DEGREE=Math.PI/180;

//loading image (with all neccesary objects)
const sprite=new Image();
sprite.src="img/sprite.png";

// sounds in game
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";

//state of the game
const state={
  current:0,
  getReady:0,
  game:1,
  gameover:2
}

// start button
const startBtn = {
    x : 220,
    y : 263,
    w : 83,
    h : 29
}

//game control part
myCanvas.addEventListener("click", function(event){
  switch(state.current){
    case state.getReady:
         state.current=state.game;
         SWOOSHING.play();
         break;
    case state.game:
         bird.flap();
         FLAP.play();
         break;
    case state.gameover:
         let rect = myCanvas.getBoundingClientRect();
         let clickX = event.clientX - rect.left;
         let clickY = event.clientY - rect.top;

         // start button click
         if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h){
             pipes.reset();
             bird.speedReset();
             score.reset();
             state.current = state.getReady;
         }
         break;
  }
});

//making background
const background={
  sX:0,
  sY:0,
  w:275,
  h:226,
  x:0,
  y:myCanvas.height-226,
  draw: function(){
    context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h );
    context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x+this.w, this.y, this.w, this.h );
  }
}

//foreground
const foreground={
  sX: 276,
  sY: 0,
  w: 224,
  h: 112,
  x: 0,
  y: myCanvas.height - 112,
  dx:2,
  update: function(){
    if(state.current == state.game){
      this.x=(this.x - this.dx) % (this.w/2);
    }
  },

  draw: function(){
    context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h );
    context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x+this.w, this.y, this.w, this.h );
    context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x+2*this.w, this.y, this.w, this.h );
  }
}

// message - get ready
const getReady={
  sX:0,
  sY:228,
  w:173,
  h:152,
  x:myCanvas.width/2-173/2,
  y:80,
  draw: function(){
    if(state.current==state.getReady){
      context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h );
    }
  }
}

//message - game OVER
const gameOver={
  sX:175,
  sY:228,
  w:225,
  h:202,
  x:myCanvas.width/2-225/2,
  y:90,
  draw: function(){
    if(state.current==state.gameover){
      context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h );
    }
  }
}

//flappy bird
const bird={
  animation: [
    {sX:276, sY:112},
    {sX:276, sY:139},
    {sX:276, sY:164},
    {sX:276, sY:139},
  ],
    x:50,
    y:150,
    w:34,
    h:26,
    frame:0,

    radius:12,

    speed:0,
    gravity:0.25,
    jump:4,
    rotation:0,

    draw: function(){
      let bird=this.animation[this.frame];
      context.save();

      context.translate(this.x, this.y);
      context.rotate(this.rotation);
      context.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, -this.w/2, -this.h/2, this.w, this.h);

      context.restore();
    },

    update: function(){
      //depending on game state, the bird is flapping differently (it flaps faster in-game state)
      this.period=state.current==state.Ready? 10:5;
      //we increment frame each period
      this.frame+=frames%this.period ==0 ? 1:0;
      //frame can be in range [0, 3]
      this.frame=this.frame%this.animation.length;
      if(state.current==state.getReady){
        this.y=150; //reset bird position
        this.rotation=0*DEGREE; //start position
      }
      else{
        this.speed += this.gravity;
        this.y += this.speed;

        if(this.y + this.h/2 >= myCanvas.height - foreground.h || this.y-this.h/2<=0){
            this.y = myCanvas.height - foreground.h - this.h/2;
            if(state.current == state.game){
              state.current = state.gameover;
              DIE.play();
            }
        }
        //If the bird is falling down, then
        if(this.speed>=this.jump){
          this.rotation=75*DEGREE;
          this.frame=1;
        }
        else{
          this.rotation=-25*DEGREE;
        }
     }
    },
    flap: function(){
      this.speed=-this.jump;
    },
    speedReset : function(){
        this.speed = 0;
    }
}

//pipes
const pipes = {
    position : [],

    top : {
        sX : 553,
        sY : 0
    },
    bottom:{
        sX : 502,
        sY : 0
    },

    w : 53,
    h : 400,
    gap : 120,
    maxYPos : -150,
    dx : 2,

    draw : function(){
        for(let i  = 0; i < this.position.length; i++){
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            // top pipe
            context.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);

            // bottom pipe
            context.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);
        }
    },

    update: function(){
        if(state.current !== state.game) return;

        if(frames%100 == 0){
            this.position.push({
                x : myCanvas.width,
                y : this.maxYPos * ( Math.random() + 1)
            });
        }
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i];
            let bottomPipeYPos = p.y + this.h + this.gap;

            // collision
            // top pipe
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h){
                state.current = state.gameover;
                HIT.play();
            }
            // bottom pipe
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h){
                state.current = state.gameover;
                HIT.play();
            }

            // MOVE THE PIPES TO THE LEFT
            p.x -= this.dx;
            // if pipe goes out of canvas, we delete it from array
            if(p.x + this.w <= 0){
                this.position.shift();
                score.value += 1;
                SCORE_S.play();
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }

        }
    },
    reset : function(){
        this.position = [];
    }
}

// score
const score= {
    best : parseInt(localStorage.getItem("best")) || 0,
    value : 0,

    draw : function(){
        context.fillStyle = "#FFF";
        context.strokeStyle = "#000";

        if(state.current == state.game){
            context.lineWidth = 2;
            context.font = "35px Teko";
            context.fillText(this.value, myCanvas.width/2, 50);
            context.strokeText(this.value, myCanvas.width/2, 50);

        }else if(state.current == state.gameover){
            // score value
            context.font = "25px Teko";
            context.fillText(this.value, 315, 186);
            context.strokeText(this.value, 315, 186);
            // best score
            context.fillText(this.best, 310, 228);
            context.strokeText(this.best, 310, 228);
        }
    },

    reset : function(){
        this.value = 0;
    }
}

//medal at the end
const medal={
  //the coordinates of the starting medal, for the others we just add distance
      sX:313,
      sY:112,
      x:163,
      y:178,
      w:45,
      h:45,

      draw: function(){
        //the medal for first playing
          if(state.current == state.gameover){
            if(score.best==0 || score.value==0){context.drawImage(sprite, medal.sX, medal.sY, this.w, this.h, this.x, this.y, this.w, this.h);}
       else if(score.value<score.best/2){context.drawImage(sprite, medal.sX+47, medal.sY+46, this.w, this.h, this.x, this.y, this.w, this.h);}
       else if(score.value>score.best/2 && score.value<score.best){context.drawImage(sprite, medal.sX+50, medal.sY, this.w, this.h, this.x, this.y, this.w, this.h);}
       else if(score.best>0 && score.value>=score.best){context.drawImage(sprite, medal.sX, medal.sY+46, this.w, this.h, this.x, this.y, this.w, this.h);}
          }
      }
}

function draw(){
    context.fillStyle = "#6495ED";
    context.fillRect(0, 0, myCanvas.width, myCanvas.height);
    background.draw();
    pipes.draw();
    foreground.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
    medal.draw();
}
function update(){
    bird.update();
    foreground.update();
    pipes.update();
}
function loop(){
  update();
  draw();
  frames++;
  requestAnimationFrame(loop);
}
loop();
