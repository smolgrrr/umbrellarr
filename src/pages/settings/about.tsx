import SettingsAbout from '@app/components/Settings/SettingsAbout';
import SettingsLayout from '@app/components/Settings/SettingsLayout';
import type { NextPage } from 'next';

const SettingsAboutPage: NextPage = () => {
  return (
    <SettingsLayout>
      <SettingsAbout />
    </SettingsLayout>
  );
};

export default SettingsAboutPage;
