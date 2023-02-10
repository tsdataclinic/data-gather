import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { NavLink, useMatch } from 'react-router-dom';
import * as Scroll from 'react-scroll';
import { motion, AnimatePresence } from 'framer-motion';
import * as InterviewScreen from '../../../models/InterviewScreen';
import { actionTypeToDisplayString } from '../../../models/ConditionalAction';
import unsavedChangesConfirm from './unsavedChangesConfirm';

const SCROLL_OFFSET = -100;

type Props = {
  defaultLanguage: string;
  isSelected: boolean;
  onScreenSelect: (screenId: string) => void;
  screen: InterviewScreen.WithChildrenT;
  unsavedChanges: boolean;
};

export default function ScreenLink({
  isSelected,
  onScreenSelect,
  screen,
  defaultLanguage,
  unsavedChanges,
}: Props): JSX.Element {
  const interviewPath = useMatch('/interview/:interviewId/*')?.pathnameBase;
  const [selectedEntry, setSelectedEntry] = React.useState<string | undefined>(
    undefined,
  );

  const screenMenuItemClass = classNames(
    'flex text-slate-600 flex-row gap-2.5 items-center py-2.5 pr-5 pl-14 w-full transition-colors duration-200',
    {
      'bg-blue-100': isSelected && selectedEntry === null,
    },
  );

  const entryMenuItemClass = (id: string): string =>
    classNames(
      'flex flex-row text-slate-600 gap-2.5 items-center py-2.5 pr-5 pl-20 w-full hover:text-blue-700 cursor-pointer transition-colors duration-200',
      { 'bg-blue-100': selectedEntry === id },
    );

  return (
    <div className="w-full" key={screen.id}>
      <div className={screenMenuItemClass}>
        <FontAwesomeIcon
          size="1x"
          className="cursor-grab pr-2.5 transition-transform hover:scale-110 hover:text-slate-500"
          icon={IconType.faGripVertical}
        />
        <NavLink
          className="hover:text-blue-700"
          to={`${interviewPath}/screen/${screen.id}`}
          onClick={e => {
            const letsGo = unsavedChangesConfirm(unsavedChanges);
            if (!letsGo) {
              e.preventDefault();
            } else {
              onScreenSelect(screen.id);
              setSelectedEntry(undefined);
            }
          }}
        >
          {InterviewScreen.getTitle(screen, defaultLanguage)}
        </NavLink>
      </div>

      <AnimatePresence mode="sync">
        {isSelected ? (
          <motion.div
            key="sub-links"
            className="flex w-full flex-col items-center overflow-hidden p-0"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {/* Header */}
            <Scroll.Link
              smooth
              offset={SCROLL_OFFSET}
              className={entryMenuItemClass('HEADER')}
              to="HEADER"
              duration={250}
              containerId="scrollContainer"
              onClick={() => setSelectedEntry('HEADER')}
            >
              <FontAwesomeIcon size="1x" icon={IconType.faTag} />
              Header
            </Scroll.Link>

            {/* Entries */}
            {screen.entries.map(entry => (
              <Scroll.Link
                smooth
                offset={SCROLL_OFFSET}
                className={entryMenuItemClass(entry.id)}
                key={entry.id}
                to={entry.id}
                duration={250}
                containerId="scrollContainer"
                onClick={() => setSelectedEntry(entry.id)}
              >
                <FontAwesomeIcon size="1x" icon={IconType.faQuestion} />
                {entry.name}
              </Scroll.Link>
            ))}

            {/* Action */}
            {screen.actions.map(action => (
              <Scroll.Link
                smooth
                offset={SCROLL_OFFSET}
                key={action.id}
                className={entryMenuItemClass(action.id)}
                to={action.id}
                duration={250}
                containerId="scrollContainer"
                onClick={() => setSelectedEntry(action.id)}
              >
                <FontAwesomeIcon size="1x" icon={IconType.faLocationArrow} />
                Action: {actionTypeToDisplayString(action.actionConfig.type)}
              </Scroll.Link>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
