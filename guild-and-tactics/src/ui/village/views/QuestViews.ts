import type { UserInterfaceSounds } from '../../UserInterfaceSounds';
import type { QuestCardViewModel, QuestDetailViewModel } from '../presenters/TavernPresenters';
import type { MusterCardViewModel } from '../presenters/MemberPresenters';
import { createElementWithClass } from './DomPrimitives';
import { renderMusterCard } from './MemberCardViews';
import { createSoundedButton } from './SoundedButton';

export function renderQuestCard(
  viewModel: QuestCardViewModel,
  sounds: UserInterfaceSounds,
  onOpen: () => void,
): HTMLElement {
  const questCard = createElementWithClass('button', 'village-card');
  questCard.innerHTML = `
    <h3>${viewModel.title} <span class="difficulty-stars">${viewModel.starsLabel}</span></h3>
    <p>${viewModel.locationLine}</p>
    <p>${viewModel.rewardLine}</p>
  `;
  questCard.addEventListener('mouseenter', () => sounds.playMenuHover());
  questCard.addEventListener('click', () => {
    sounds.playMenuConfirm();
    onOpen();
  });
  return questCard;
}

export function renderQuestDetail(
  viewModel: QuestDetailViewModel,
  musterCards: readonly MusterCardViewModel[],
  sounds: UserInterfaceSounds,
  actions: {
    onToggleMember: (memberIdentifier: string) => void;
    onEmbark: () => void;
  },
): HTMLElement {
  const questDetail = createElementWithClass('div', 'quest-detail');
  questDetail.innerHTML = `
    <h2>${viewModel.title} <span class="difficulty-stars">${viewModel.starsLabel}</span></h2>
    <p class="quest-description">${viewModel.description}</p>
    <p>${viewModel.summaryLine}</p>
    <p class="menu-section-title">${viewModel.musterCounterLine}</p>
  `;

  const musterGrid = createElementWithClass('div', 'muster-grid');
  for (const musterCard of musterCards) {
    musterGrid.appendChild(
      renderMusterCard(musterCard, sounds, () => actions.onToggleMember(musterCard.memberIdentifier)),
    );
  }
  questDetail.appendChild(musterGrid);

  questDetail.appendChild(
    createSoundedButton(sounds, {
      label: viewModel.embarkButtonLabel,
      isDisabled: viewModel.embarkDisabled,
      className: 'primary-action-button',
      onClick: actions.onEmbark,
    }),
  );
  return questDetail;
}
