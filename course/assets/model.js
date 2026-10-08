export const W=800,H=400,STEP=1/120;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class Model {
 constructor(id){this.id=id;this.params={gravity:300,restitution:.75,damping:.5,stiffness:35,power:4,speed:100,voltage:5,resistance:100,field:300};this.target={x:400,y:150};this.closed=true;this.reset();}
 reset(){this.time=0;this.score=0;this.scored=false;this.shots=0;this.drag=null;this.trail=[];this.links=[];this.balls=[this.ball(100,150)];
 if([6,8,9,14].includes(this.id)){this.balls=[this.ball(this.id===14?110:400,this.id===14?300:60),this.ball(400,200),this.ball(510,200),this.ball(455,300)];if(this.id!==14)this.balls[0].fixed=true;this.links=[{a:0,b:1,length:this.id===14?320:140,type:this.id===9?'rigid':'soft'},{a:1,b:2,length:110,type:'rigid'},{a:1,b:3,length:114,type:'soft'},{a:2,b:3,length:114,type:'rigid'}];if(this.id===14)this.links.shift();if(this.id===6){this.balls=this.balls.slice(0,2);this.links=this.links.slice(0,1);}}
 if(this.id===7)this.balls=[this.ball(170,100),this.ball(400,220),this.ball(650,100)];
 if(this.id===10)this.balls=[this.ball(120,300)];
 this.balls.forEach((b,i)=>{b.vx=this.id===3?this.params.speed:this.id===7?(i-1)*100:0;});}
 ball(x,y){return {x,y,vx:0,vy:0,r:16,fixed:false};}
 current(){return this.closed?this.params.voltage/this.params.resistance:0;}
 step(dt=STEP){this.time+=dt;const id=this.id,p=this.params;
 if(id===1 || id===11)return;
 if(id===2){const b=this.balls[0],f=1-Math.exp(-3*dt);b.x+=(this.target.x-b.x)*f;b.y+=(this.target.y-b.y)*f;return;}
 const old=this.balls.map(b=>({x:b.x,y:b.y}));
 for(const b of this.balls){b.ax=0;b.ay=[5,6,7,8,9,10,13,14].includes(id)?p.gravity:0;}
 for(const l of this.links){if(l.type!=='soft')continue;const a=this.balls[l.a],b=this.balls[l.b],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;const f=clamp(p.stiffness*(d-l.length),-18000,18000);if(!a.fixed){a.ax+=f*dx/d;a.ay+=f*dy/d;}if(!b.fixed){b.ax-=f*dx/d;b.ay-=f*dy/d;}}
 for(let i=0;i<this.balls.length;i++){const b=this.balls[i];if(b.fixed || this.drag?.index===i)continue;
 if(id===12){const dx=this.target.x-b.x,dy=this.target.y-b.y,q=Math.exp(-(dx*dx+dy*dy)/50000);b.ax+=p.field*dx*q/100;b.ay+=p.field*dy*q/100;}
 if(id===13){const dx=this.target.x-b.x,dy=this.target.y-b.y,d=Math.hypot(dx,dy)||1,sign=-Math.tanh((b.x-400)/45);b.ax+=p.field*dx/d*sign;b.ay+=p.field*dy/d*sign;}
 b.vx+=b.ax*dt;b.vy+=b.ay*dt;
 const damping=id===3?0:id===13?p.damping+4*Math.exp(-(((b.x-400)/65)**2)):p.damping;
 const fade=Math.exp(-damping*dt);b.vx=clamp(b.vx*fade,-1200,1200);b.vy=clamp(b.vy*fade,-1200,1200);b.x+=b.vx*dt;b.y+=b.vy*dt;}
 for(let pass=0;pass<8;pass++)for(const l of this.links){if(l.type!=='rigid')continue;const a=this.balls[l.a],b=this.balls[l.b],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;const wa=a.fixed || this.drag?.index===l.a?0:1,wb=b.fixed || this.drag?.index===l.b?0:1;if(!wa&&!wb)continue;const error=(d-l.length)/d/(wa+wb);a.x+=dx*error*wa;a.y+=dy*error*wa;b.x-=dx*error*wb;b.y-=dy*error*wb;}
 if(this.links.some(l=>l.type==='rigid'))this.balls.forEach((b,i)=>{if(!b.fixed && this.drag?.index!==i){b.vx=clamp((b.x-old[i].x)/dt,-1200,1200);b.vy=clamp((b.y-old[i].y)/dt,-1200,1200);}});
 for(let i=0;i<this.balls.length;i++)for(let j=i+1;j<this.balls.length;j++){const a=this.balls[i],b=this.balls[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=a.r+b.r;if(d>=min)continue;const nx=d?dx/d:1,ny=d?dy/d:0,wa=a.fixed||this.drag?.index===i?0:1,wb=b.fixed||this.drag?.index===j?0:1;if(!wa&&!wb)continue;const overlap=(min-d)/(wa+wb);a.x-=nx*overlap*wa;a.y-=ny*overlap*wa;b.x+=nx*overlap*wb;b.y+=ny*overlap*wb;const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(relative<0){const impulse=-(1+p.restitution)*relative/(wa+wb);a.vx-=impulse*nx*wa;a.vy-=impulse*ny*wa;b.vx+=impulse*nx*wb;b.vy+=impulse*ny*wb;}}
 for(const b of this.balls){if(b.fixed)continue;if(b.x<b.r){b.x=b.r;if(b.vx<0)b.vx=-b.vx*p.restitution;}if(b.x>W-b.r){b.x=W-b.r;if(b.vx>0)b.vx=-b.vx*p.restitution;}if(b.y<b.r){b.y=b.r;if(b.vy<0)b.vy=-b.vy*p.restitution;}if(b.y>H-b.r){b.y=H-b.r;if(b.vy>0)b.vy=-b.vy*p.restitution;b.vx*=Math.exp(-2*dt);}}
 const b=this.balls[0];this.trail.push({x:b.x,y:b.y});if(this.trail.length>100)this.trail.shift();
 if([10,14].includes(id)&&this.shots>0&&!this.scored&&Math.hypot(b.x-710,b.y-250)<40){this.score++;this.scored=true;}}
 launch(index,pointer,anchor){const b=this.balls[index];b.x=anchor.x;b.y=anchor.y;b.vx=clamp((anchor.x-pointer.x)*this.params.power,-900,900);b.vy=clamp((anchor.y-pointer.y)*this.params.power,-900,900);this.shots++;this.scored=false;this.drag=null;}
 addLink(a,b){if(a===b||this.links.some(l=>l.a===a&&l.b===b||l.b===a&&l.a===b))return false;this.links.push({a,b,length:Math.hypot(this.balls[a].x-this.balls[b].x,this.balls[a].y-this.balls[b].y),type:'soft'});return true;}
}
