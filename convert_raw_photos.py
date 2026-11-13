import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'tmp-image-converter'))
import rawpy
from PIL import Image

source = Path(r'C:\Users\USA11\Downloads\abc')
destination = source / 'JPG'
destination.mkdir(exist_ok=True)
files = sorted(source.glob('*.ARW'))
failures = []
for index, path in enumerate(files, 1):
    target = destination / (path.stem + '.jpg')
    try:
        if target.exists():
            raise FileExistsError(f'Output already exists: {target.name}')
        with rawpy.imread(str(path)) as raw:
            pixels = raw.postprocess(use_camera_wb=True, output_bps=8)
        Image.fromarray(pixels).save(target, 'JPEG', quality=95, subsampling=0)
        with Image.open(target) as check:
            check.verify()
        print(f'{index}/{len(files)} {target.name}', flush=True)
    except Exception as error:
        failures.append((path.name, str(error)))
        print(f'FAILED {path.name}: {error}', flush=True)
print(f'Finished: {len(files) - len(failures)} converted; {len(failures)} failed.', flush=True)
if failures:
    sys.exit(1)
