export async function renderAssetStage({ asset, stage, status }) {
  status.hidden = true;

  const shell = document.createElement('div');
  shell.className = 'texture-stage-shell';

  const image = document.createElement('img');
  image.className = 'asset-stage-image';
  image.src = asset.previewUrl;
  image.alt = `Preview texture ${asset.title}`;
  image.loading = 'eager';
  image.decoding = 'async';

  shell.appendChild(image);
  stage.appendChild(shell);
}