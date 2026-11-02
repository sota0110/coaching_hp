"""Snapshot public site pages and media into React data. No original scripts execute."""
from html.parser import HTMLParser
from urllib.request import urlopen, Request
from urllib.parse import urljoin,urlsplit,quote,unquote
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json,re,hashlib
ROOT=Path(__file__).resolve().parent.parent
BASE='https://coaching-therapy.jp/'
ASSETS=ROOT/'public/assets'
CACHE=ROOT/'reference';CACHE.mkdir(exist_ok=True)
failures=[]
def fetch(url):return urlopen(Request(quote(url,safe=':/?=&%+#@'),headers={'User-Agent':'Mozilla/5.0'}),timeout=40).read()
def local_asset(url):
 url=urljoin(BASE,url);extension=Path(unquote(urlsplit(url).path)).suffix or '.bin'
 name=hashlib.sha256(url.encode()).hexdigest()[:16]+extension
 path=ASSETS/name
 if not path.exists():
  try:path.write_bytes(fetch(url))
  except Exception as e:failures.append((url,str(e)));return url
 return '/assets/'+name
def css_assets(css):
 return re.sub(r'url\(([\'"]?)(https://[^)\'\"]+)\1\)',lambda m:'url("'+local_asset(m.group(2))+'")',css)
class Tree(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True);self.root={'tag':'root','attrs':{},'children':[]};self.stack=[self.root];self.body=False;self.skip=0;self.styles=[];self.in_style=False;self.style_id='';self.body_class='';self.title='';self.in_title=False;self.links=[]
 def handle_starttag(self,t,a):
  a=dict(a)
  if t=='body':self.body=True;self.body_class=a.get('class','');return
  if t=='title':self.in_title=True;return
  if t=='style':self.in_style=True;self.style_id=a.get('id','');self.css='';return
  if t in ['script','noscript']:self.skip+=1;return
  if not self.body or self.skip or t in ['meta','link']:return
  a={k:v for k,v in a.items() if not k.startswith('on') and k not in ['srcset','sizes','fetchpriority','data-vkb-slider']}
  if t in ['img','video','source'] and a.get('src'):a['src']=local_asset(a['src'])
  if t=='a' and a.get('href'):
   href=urljoin(BASE,a['href']);p=urlsplit(href)
   if p.netloc=='coaching-therapy.jp':
    self.links.append(href);a['href']=unquote(p.path)+(('?'+p.query) if p.query else '')+(('#'+p.fragment) if p.fragment else '')
  if t=='form':a.pop('action',None);a.pop('method',None)
  if 'style' in a:a['style']=css_assets(a['style'])
  n={'tag':t,'attrs':a,'children':[]};self.stack[-1]['children'].append(n)
  if t not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:self.stack.append(n)
 def handle_startendtag(self,t,a):self.handle_starttag(t,a);self.handle_endtag(t)
 def handle_endtag(self,t):
  if t=='body':self.body=False;return
  if t=='title':self.in_title=False;return
  if t=='style':
   if self.body or self.style_id=='core-block-supports-inline-css':self.styles.append(css_assets(self.css))
   self.in_style=False;return
  if t in ['script','noscript']:self.skip=max(0,self.skip-1);return
  if self.skip:return
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i]['tag']==t:self.stack=self.stack[:i];break
 def handle_data(self,s):
  if self.in_title:self.title+=s
  if self.in_style:self.css+=s;return
  if self.body and not self.skip and s.strip():self.stack[-1]['children'].append(s)
def normalize(url):
 p=urlsplit(urljoin(BASE,url));path=unquote(p.path)
 if p.netloc!='coaching-therapy.jp' or re.search(r'\.(?:png|jpe?g|pdf|mp4|svg|xml|php|css|js)$',path,re.I) or any(x in path for x in ['/wp-','/feed/','/embed/','/author/']):return None
 if p.query:return None
 return path if path.endswith('/') else path+'/'
records=json.load(open('/tmp/coaching-pages.json'))
posts=json.loads(fetch(BASE+'wp-json/wp/v2/posts?per_page=100'))
(ROOT/'reference/posts.json').write_text(json.dumps(posts,ensure_ascii=False,indent=2))
queue=list(dict.fromkeys([normalize(x['link']) for x in records+posts]));seen=set();pages={}
while queue:
 batch=list(dict.fromkeys(x for x in queue if x and x not in seen));queue=[]
 if not batch:break
 def load(path):
  fn=CACHE/(hashlib.sha256(path.encode()).hexdigest()[:12]+'.html')
  try:
   if not fn.exists():fn.write_bytes(fetch(BASE+quote(path.lstrip('/'))))
   tree=Tree();tree.feed(fn.read_text());return path,tree
  except Exception as e:print('Page failed',path,str(e),flush=True);return path,None
 with ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(load,batch))
 for path,tree in results:
  seen.add(path)
  if not tree:continue
  pages[path]={'title':tree.title,'bodyClass':tree.body_class,'nodes':tree.root['children'],'css':'\n'.join(tree.styles)}
  print('Imported',path,tree.title.split('|')[0],flush=True)
  for u in tree.links:
   normalized=normalize(u)
   if normalized and normalized not in seen:queue.append(normalized)
(ROOT/'src/pages.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2))
(ROOT/'reference/manifest.json').write_text(json.dumps({'pages':[{ 'path':p,'title':v['title'].split('|')[0].strip()} for p,v in pages.items()],'asset_failures':failures},ensure_ascii=False,indent=2))
page_dir=ROOT/'src/pages';page_dir.mkdir(exist_ok=True)
manifest={}
for index,(path,page) in enumerate(pages.items()):
 name=f'page-{index:02}.json';(page_dir/name).write_text(json.dumps(page,ensure_ascii=False,separators=(',',':')));manifest[path]=name
(ROOT/'src/page-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('DONE:',len(pages),'pages,',len(failures),'failed assets',flush=True)
