import asyncio, sys, importlib, os
from engine import build
mods = sys.argv[1].split(',')
langs = tuple(sys.argv[2].split(',')) if len(sys.argv) > 2 else ('pt', 'en')
guides = [importlib.import_module(m).GUIDE for m in mods]
asyncio.run(build(guides, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out'), langs))
