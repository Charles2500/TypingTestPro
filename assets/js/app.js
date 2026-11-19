const $ = (id) => document.getElementById(id);
const textDisplay = $('text'), input = $('typingInput');
const passages = {
 easy: ["Practice makes progress. Small steps every day can help you build confidence and improve your typing skills.","The quick brown fox jumps over the lazy dog. Take your time and focus on accuracy before speed.","A calm mind and steady hands can make typing easier. Keep practicing and enjoy the process."],
 medium: ["Technology continues to change the way people communicate, learn, and work in their everyday lives. Good digital skills help us adapt to new opportunities.","Developing strong typing habits takes patience, consistency, and attention to detail. Focus on each word and let your speed improve naturally.","Clear communication begins with clear thinking. Organize your ideas, stay focused, and take one step at a time."],
 hard: ["JavaScript, HTML, and CSS are essential technologies for creating interactive websites and accessible applications. Developers refine their work through testing and iteration.","Efficient developers understand the importance of maintainable code, logical thinking, accessibility, and problem-solving. A reliable application should behave consistently.","A well-designed application balances performance, usability, responsiveness, and security while providing a predictable experience across different devices."]
};
let passage='', started=false, finished=false, timer=null, totalTime=60, timeLeft=60, startedAt=0;
const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
function toast(title, message, type='success') {
 const box=document.createElement('div'); box.className='toast';
 const icon=type==='warning'?'⏰':type==='error'?'!':'✓';
 const strong=document.createElement('b'); strong.textContent=title;
 const p=document.createElement('p'); p.textContent=message;
 const symbol=document.createElement('span'); symbol.className='toast-symbol'; symbol.textContent=icon;
 const content=document.createElement('div'); content.append(strong,p);
 box.append(symbol,content); $('toastContainer').append(box);
 setTimeout(()=>{box.classList.add('out');setTimeout(()=>box.remove(),300)},3500);
}
function newPassage(){const level=$('difficulty').value;const list=passages[level];return list[Math.floor(Math.random()*list.length)];}
function render(){
 const typed=input.value, fragment=document.createDocumentFragment();
 [...passage].forEach((char,i)=>{const span=document.createElement('span');span.textContent=char;if(i<typed.length)span.className=typed[i]===char?'correct-char':'wrong-char';else if(i===typed.length)span.className='cursor-char';fragment.append(span);});
 textDisplay.replaceChildren(fragment);
}
function stats(){
 const typed=input.value;let correct=0,errors=0;
 for(let i=0;i<typed.length;i++){if(typed[i]===passage[i])correct++;else errors++;}
 const elapsed=Math.max((Date.now()-startedAt)/60000,1/60);
 return {correct,errors,total:typed.length,accuracy:typed.length?Math.round(correct/typed.length*100):100,wpm:Math.round(correct/5/elapsed)};
}
function update(){
 const s=stats();$('wpm').textContent=s.wpm;$('accuracy').textContent=s.accuracy+'%';$('errors').textContent=s.errors;
 $('progressBar').style.width=Math.min(input.value.length/passage.length*100,100)+'%';render();
}
function begin(){
 if(started||finished)return;started=true;startedAt=Date.now();input.disabled=false;input.focus();$('startBtn').disabled=true;$('status').textContent='Typing in progress…';toast('Test started','Your timer is running. Good luck!');
 timer=setInterval(()=>{timeLeft--; $('timer').textContent=timeLeft;if(timeLeft<=0)finish('time');},1000);
}
async function finish(reason){
 if(finished)return;clearInterval(timer);started=false;finished=true;input.disabled=true;$('startBtn').disabled=false;$('startBtn').textContent='Start Test';$('status').textContent='Test completed';
 const s=stats();$('finalWpm').textContent=s.wpm;$('finalAccuracy').textContent=s.accuracy+'%';$('finalErrors').textContent=s.errors;
 $('resultTitle').textContent=reason==='time'?"Time's up!":'Passage completed!';
 $('resultMessage').textContent=reason==='time'?'Your time has ended. Here are your results.':'You completed the passage. Great focus!';
 try{
  const response=await fetch('api/save-result.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({csrf_token:csrf,wpm:s.wpm,accuracy:s.accuracy,errors:s.errors,duration:totalTime,difficulty:$('difficulty').value})});
  const data=await response.json();
  if(response.ok){$('personalBestMessage').textContent=s.wpm>=data.personal_best?'New personal best!':`Your personal best is ${data.personal_best} WPM.`;}
  else $('personalBestMessage').textContent='Result could not be saved. Please check your connection.';
 }catch(e){$('personalBestMessage').textContent='Result could not be saved. Please try again later.';}
 $('resultModal').classList.add('show');$('resultModal').setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
 toast(reason==='time'?"Time's up!":'Test completed','Your results are ready.',reason==='time'?'warning':'success');
}
function closeModal(){$('resultModal').classList.remove('show');$('resultModal').setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');}
function reset(showMessage=false){
 clearInterval(timer);started=false;finished=false;totalTime=Number($('duration').value);timeLeft=totalTime;passage=newPassage();input.value='';input.disabled=true;
 $('timer').textContent=timeLeft;$('wpm').textContent='0';$('accuracy').textContent='100%';$('errors').textContent='0';$('progressBar').style.width='0%';$('status').textContent='Press Start Test when you are ready.';$('startBtn').disabled=false;$('startBtn').textContent='Start Test';closeModal();render();if(showMessage)toast('Test reset','A fresh passage is ready.','info');
}
$('startBtn').addEventListener('click',begin);
$('resetBtn').addEventListener('click',()=>reset(true));
$('tryAgainBtn').addEventListener('click',()=>{reset();begin();});
$('closeModal').addEventListener('click',closeModal);$('closeResultBtn').addEventListener('click',closeModal);
$('resultModal').addEventListener('click',e=>{if(e.target.classList.contains('modal-backdrop'))closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
textDisplay.addEventListener('click',()=>{if(!started&&!finished)begin();if(started)input.focus();});
input.addEventListener('input',()=>{if(!started||finished)return;if(input.value.length>passage.length)input.value=input.value.slice(0,passage.length);update();if(input.value.length===passage.length)finish('complete');});
$('difficulty').addEventListener('change',()=>reset(true));$('duration').addEventListener('change',()=>reset(true));
reset();
