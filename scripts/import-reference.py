"""Import the public reference page as a sanitized React content tree and local assets."""
from html.parser import HTMLParser
from urllib.request import urlopen, Request
from urllib.parse import urljoin, urlsplit, quote, unquote
from pathlib import Path
import json,re,hashlib,sys
BASE='https://coaching-therapy.jp/'
ROOT=Path(__file__).resolve().parent.parent
assets=ROOT/'public/assets'
cache={}
def download(url):
 url=urljoin(BASE,url)
 if url in cache:return cache[url]
 p=urlsplit(url); ext=Path(unquote(p.path)).suffix or '.bin'
 name=hashlib.sha256(url.encode()).hexdigest()[:16]+ext
 local='/assets/'+name;cache[url]=local
 request=quote(url,safe=':/?=&%+#@')
 if (assets/name).exists():return local
 try:
  data=urlopen(Request(request,headers={'User-Agent':'Mozilla/5.0'}),timeout=45).read()
  if ext=='.css':data=localize_css(data.decode()).encode()
  (assets/name).write_bytes(data)
 except Exception as e:
  print('Asset failed:',p.path,str(e)); cache[url]=url;return url
 return local
def localize_css(css):
 def sub(m):
  u=m.group(1).strip(' \'"')
  if u.startswith(('data:','#')):return m.group(0)
  return 'url("'+download(u)+'")'
 return re.sub(r'url\(([^)]+)\)',sub,css)
class Parser(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True);self.root={'tag':'root','attrs':{},'children':[]}; self.stack=[self.root];self.styles=[];self.in_body=False;self.skip=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='body': self.in_body=True;self.body_class=a.get('class','');return
  if tag=='link' and a.get('rel')=='stylesheet':
   url=urljoin(BASE,a['href'])
   try: css=urlopen(Request(quote(url,safe=':/?=&%'),headers={'User-Agent':'Mozilla/5.0'})).read().decode()
   except Exception as e: print('Stylesheet failed:',url,str(e)); return
   css=re.sub(r'url\(([^)]+)\)',lambda m:'url('+urljoin(url,m.group(1).strip(' \'"'))+')' if not m.group(1).strip(' \'"').startswith('data:') else m.group(0),css)
   self.styles.append(localize_css(css));return
  if tag=='style':self.style_buffer='';self.skip_style=True;return
  if tag in ['script','noscript']:
   self.skip+=1;return
  if self.skip or not self.in_body:return
  if tag in ['meta','link']:return
  a={k:v for k,v in a.items() if not k.startswith('on') and k not in ['srcset','sizes','fetchpriority','data-vkb-slider']}
  if tag in ['img','video','source'] and a.get('src'):a['src']=download(a['src'])
  if 'style' in a:a['style']=localize_css(a['style'])
  if tag=='a' and a.get('href')==BASE:a['href']='/'
  n={'tag':tag,'attrs':a,'children':[]};self.stack[-1]['children'].append(n)
  if tag not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:self.stack.append(n)
 def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs);self.handle_endtag(tag)
 def handle_endtag(self,tag):
  if tag=='body':self.in_body=False;return
  if tag in ['script','noscript']:self.skip=max(0,self.skip-1);return
  if tag=='style':self.styles.append(localize_css(self.style_buffer));self.skip_style=False;return
  if self.skip:return
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i]['tag']==tag:self.stack=self.stack[:i];break
 def handle_data(self,d):
  if getattr(self,'skip_style',False):self.style_buffer+=d;return
  if self.in_body and not self.skip and d.strip():self.stack[-1]['children'].append(d)
source=Path(sys.argv[1]).read_text() if len(sys.argv)>1 else urlopen(BASE).read().decode()
p=Parser();p.feed(source)
(ROOT/'src/content.json').write_text(json.dumps({'bodyClass':p.body_class,'nodes':p.root['children']},ensure_ascii=False,indent=2))
css='\n'.join(p.styles)
# Resolve imported font stylesheets before other declarations.
for url in re.findall(r'@import url\("([^"]+)"\);',css):
 path=ROOT/'public'/url.lstrip('/')
 if path.exists():css=localize_css(path.read_text())+'\n'+css
css=re.sub(r'@import url\("[^"]+"\);','',css)
css=re.sub(r'@charset\s+"[^"]+";','',css).replace(':last-child()',':last-child')
(ROOT/'src/reference.css').write_text(css)
print('Imported',len(cache),'assets')
