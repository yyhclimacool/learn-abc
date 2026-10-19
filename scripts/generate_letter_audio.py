"""macOS-only asset generation. Playback on other machines needs no say/Python.
Fixed Samantha recordings in literal-character mode; preserve complete consonant onset.
Apple mode reference: https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/SpeechSynthesisProgrammingGuide/FineTuning/FineTuning.html
"""
import wave
import subprocess
import tempfile
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
names=['the letter a','bee','see','dee','ee','eff','gee','aitch','eye','jay','kay','ell','em','en','oh','pee','cue','ar','ess','tee','you','vee','double you','ex','why','zee']
manifest={}
with tempfile.TemporaryDirectory() as tmp:
    for letter,name in zip('abcdefghijklmnopqrstuvwxyz',names):
        path=Path(tmp)/f'{letter}.wav'
        subprocess.run(['say','-v','Samantha','-r','150','--file-format=WAVE','--data-format=LEI16','-o',str(path),f'[[char LTRL]]{letter}[[char NORM]]'],check=True)
        with wave.open(str(path),'rb') as source:
            channels,width,rate=source.getnchannels(),source.getsampwidth(),source.getframerate()
            data=source.readframes(source.getnframes())
        assert width==2
        lead=bytes(int(rate*.18)*channels*width)
        tail=bytes(int(rate*.12)*channels*width)
        output=root/f'public/audio/letters/{letter}.wav'
        with wave.open(str(output),'wb') as dest:
            dest.setnchannels(channels);dest.setsampwidth(width);dest.setframerate(rate)
            dest.writeframes(lead+data+tail)
        manifest[letter]={'name':name,'voice':'Samantha','input':f'[[char LTRL]]{letter}[[char NORM]]','duration':round((len(lead)+len(data)+len(tail))/(channels*width*rate),3)}
(root/'public/audio/letters/manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Generated 26 letter-name recordings.')
