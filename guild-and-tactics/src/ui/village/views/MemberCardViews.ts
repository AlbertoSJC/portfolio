import type { UserInterfaceSounds } from '../../UserInterfaceSounds';
import { createMemberPortraitCanvas } from '../MemberPortrait';
import type {
  MemberIdentityViewModel,
  MusterCardViewModel,
  RecruitCardViewModel,
  RosterCardViewModel,
} from '../presenters/MemberPresenters';
import { createElementWithClass } from './DomPrimitives';
import { createSoundedButton } from './SoundedButton';

function portraitFor(identity: MemberIdentityViewModel): HTMLCanvasElement {
  return createMemberPortraitCanvas(identity.raceDisplayName, identity.classDisplayName);
}

export function renderRosterCard(
  viewModel: RosterCardViewModel,
  sounds: UserInterfaceSounds,
  onOpenCharacterSheet: () => void,
): HTMLElement {
  const rosterCard = createElementWithClass('button', 'village-card with-portrait');
  rosterCard.appendChild(portraitFor(viewModel));
  const cardBody = document.createElement('div');
  cardBody.innerHTML = `
    <h3>${viewModel.displayName}</h3>
    <p>${viewModel.summaryLine}</p>
    <p>${viewModel.experienceLine}</p>
    <div class="resource-bar"><div class="resource-bar-fill experience" style="width:${viewModel.experienceFillPercent}%"></div></div>
    <p>${viewModel.equippedLine}</p>
  `;
  rosterCard.appendChild(cardBody);
  rosterCard.addEventListener('mouseenter', () => sounds.playMenuHover());
  rosterCard.addEventListener('click', () => {
    sounds.playMenuConfirm();
    onOpenCharacterSheet();
  });
  return rosterCard;
}

export function renderRecruitCard(
  viewModel: RecruitCardViewModel,
  sounds: UserInterfaceSounds,
  onHire: () => void,
): HTMLElement {
  const recruitCard = createElementWithClass('div', 'village-card with-portrait');
  recruitCard.appendChild(portraitFor(viewModel));
  const cardBody = document.createElement('div');
  cardBody.innerHTML = `
    <h3>${viewModel.displayName}</h3>
    <p>${viewModel.summaryLine}</p>
    <p>${viewModel.feeLine}</p>
  `;
  cardBody.appendChild(
    createSoundedButton(sounds, {
      label: viewModel.hireButtonLabel,
      isDisabled: viewModel.hireDisabled,
      onClick: onHire,
    }),
  );
  recruitCard.appendChild(cardBody);
  return recruitCard;
}

export function renderMusterCard(
  viewModel: MusterCardViewModel,
  sounds: UserInterfaceSounds,
  onToggle: () => void,
): HTMLElement {
  const musterCard = createElementWithClass(
    'button',
    `muster-card ${viewModel.isSelected ? 'is-selected' : ''}`,
  );
  musterCard.appendChild(portraitFor(viewModel));
  const cardText = document.createElement('div');
  cardText.innerHTML = `
    <strong>${viewModel.displayName}</strong>
    <span>${viewModel.summaryLine}</span>
  `;
  musterCard.appendChild(cardText);
  musterCard.addEventListener('mouseenter', () => sounds.playMenuHover());
  musterCard.addEventListener('click', onToggle);
  return musterCard;
}
