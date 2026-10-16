import sys, subprocess, os
pdf=sys.argv[1]; pages=sys.argv[2].split(','); out=sys.argv[3]
from PIL import Image
ims=[]
for p in pages:
    subprocess.run(['pdftoppm','-r','45','-png','-f',p,'-l',p,'-singlefile',pdf,os.path.join(os.path.dirname(out) or '.', f'_p{p}')])
    ims.append(Image.open(os.path.join(os.path.dirname(out) or '.', f'_p{p}.png')))
W=sum(i.width for i in ims)+10*len(ims); H=max(i.height for i in ims)
o=Image.new('RGB',(W,H),'#888'); x=0
for i in ims: o.paste(i,(x,0)); x+=i.width+10
o.save(out)
