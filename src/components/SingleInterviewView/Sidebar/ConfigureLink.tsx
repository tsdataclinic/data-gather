import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { NavLink, useMatch } from 'react-router-dom';
import unsavedChangesConfirm from './unsavedChangesConfirm';

type Props = {
  isSelected: boolean;
  onSelect: () => void;
  unsavedChanges: boolean;
};

export default function ConfigureLink({
  isSelected,
  onSelect,
  unsavedChanges,
}: Props): JSX.Element {
  const interviewPath = useMatch('/interview/:interviewId/*')?.pathnameBase;
  const screenMenuItemClass = classNames(
    'flex text-slate-600 flex-row gap-2.5 items-center py-2.5 pr-5 pl-14 w-full hover:text-blue-700 transition-colors duration-200',
    {
      'bg-blue-100': isSelected,
    },
  );

  return (
    <NavLink
      className={screenMenuItemClass}
      to={`${interviewPath}/configure`}
      onClick={e => {
        const letsGo = unsavedChangesConfirm(unsavedChanges);
        if (!letsGo) {
          e.preventDefault();
        } else {
          onSelect();
        }
      }}
    >
      <FontAwesomeIcon size="1x" icon={IconType.faGear} />
      Configure
    </NavLink>
  );
}
