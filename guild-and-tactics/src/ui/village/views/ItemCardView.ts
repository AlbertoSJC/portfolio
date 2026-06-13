import type { UserInterfaceSounds } from '../../UserInterfaceSounds';
import { createItemIconCanvas } from '../ItemIcons';
import type { ItemCardViewModel, StoreCardViewModel } from '../presenters/ItemCardPresenters';
import { createElementWithClass } from './DomPrimitives';
import { createSoundedButton } from './SoundedButton';

export function renderItemCard(viewModel: ItemCardViewModel): HTMLElement {
  const itemCard = createElementWithClass('div', 'village-card with-portrait');
  itemCard.appendChild(createItemIconCanvas(viewModel.iconKind));
  itemCard.appendChild(buildItemCardBody(viewModel, ''));
  return itemCard;
}

export function renderStoreCard(
  viewModel: StoreCardViewModel,
  sounds: UserInterfaceSounds,
  actions: { onBuy: () => void; onSell: () => void },
): HTMLElement {
  const storeCard = createElementWithClass('div', 'village-card with-portrait store-card');
  storeCard.appendChild(createItemIconCanvas(viewModel.iconKind));
  const cardBody = buildItemCardBody(viewModel, 'store-card-body');

  const priceLine = createElementWithClass('p', 'store-card-price');
  priceLine.textContent = viewModel.priceLine;
  cardBody.appendChild(priceLine);

  const buttonRow = createElementWithClass('div', 'village-card-buttons');
  buttonRow.append(
    createSoundedButton(sounds, {
      label: viewModel.buyButtonLabel,
      isDisabled: viewModel.buyDisabled,
      onClick: actions.onBuy,
    }),
    createSoundedButton(sounds, {
      label: viewModel.sellButtonLabel,
      isDisabled: viewModel.sellDisabled,
      onClick: actions.onSell,
    }),
  );
  cardBody.appendChild(buttonRow);
  storeCard.appendChild(cardBody);
  return storeCard;
}

function buildItemCardBody(viewModel: ItemCardViewModel, bodyClassName: string): HTMLDivElement {
  const cardBody = createElementWithClass('div', bodyClassName);
  const detailParagraphs = viewModel.detailLines
    .map((detailLine) => `<p>${detailLine}</p>`)
    .join('');
  cardBody.innerHTML = `
    <h3>${viewModel.title}</h3>
    <p class="card-type-line">${viewModel.typeLine}</p>
    <p class="card-effect-line">${viewModel.effectLine}</p>
    <p>${viewModel.description}</p>
    ${detailParagraphs}
  `;
  return cardBody;
}
