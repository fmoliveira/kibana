/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { mount, shallow } from 'enzyme';
import { EuiProgress, EuiButtonGroup } from '@elastic/eui';
import { ThemeProvider } from 'styled-components';

import { StepAboutRuleToggleDetails } from '.';
import {
  mockRule,
  mockAboutStepRule,
} from '../../../../detection_engine/rule_management_ui/components/rules_table/__mocks__/mock';
import { HeaderSection } from '../../../../common/components/header_section';
import { StepAboutRule } from '../step_about_rule';
import type { AboutStepRule } from '../../../pages/detection_engine/rules/types';
import { getMockTheme } from '../../../../common/lib/kibana/kibana_react.mock';

jest.mock('../../../../common/lib/kibana');

const mockTheme = getMockTheme({
  eui: { euiSizeL: '10px', euiBreakpoints: { s: '450px' }, euiSizeM: '10px' },
});

describe('StepAboutRuleToggleDetails', () => {
  let stepDataMock: AboutStepRule;

  beforeEach(() => {
    stepDataMock = mockAboutStepRule();
  });

  test('it renders loading component when "loading" is true', () => {
    const wrapper = shallow(
      <StepAboutRuleToggleDetails
        loading={true}
        stepDataDetails={{
          note: stepDataMock.note,
          description: stepDataMock.description,
          setup: '',
        }}
        stepData={stepDataMock}
        rule={mockRule('mocked-rule-id')}
      />
    );

    expect(wrapper.find(EuiProgress).exists()).toBeTruthy();
    expect(wrapper.find(HeaderSection).exists()).toBeTruthy();
  });

  test('it does not render details if stepDataDetails is null', () => {
    const wrapper = shallow(
      <StepAboutRuleToggleDetails
        loading={true}
        stepDataDetails={null}
        stepData={stepDataMock}
        rule={mockRule('mocked-rule-id')}
      />
    );

    expect(wrapper.find(StepAboutRule).exists()).toBeFalsy();
  });

  test('it does not render details if stepData is null', () => {
    const wrapper = shallow(
      <StepAboutRuleToggleDetails
        loading={true}
        stepDataDetails={{
          note: '',
          description: '',
          setup: '',
        }}
        stepData={null}
        rule={mockRule('mocked-rule-id')}
      />
    );

    expect(wrapper.find(StepAboutRule).exists()).toBeFalsy();
  });

  describe('note value is empty string', () => {
    test('it does not render toggle buttons', () => {
      const mockAboutStepWithoutNote = {
        ...stepDataMock,
        note: '',
      };
      const wrapper = shallow(
        <StepAboutRuleToggleDetails
          loading={false}
          stepDataDetails={{
            note: '',
            description: stepDataMock.description,
            setup: '',
          }}
          stepData={mockAboutStepWithoutNote}
          rule={mockRule('mocked-rule-id')}
        />
      );

      expect(wrapper.find('[data-test-subj="stepAboutDetailsToggle"]').exists()).toBeFalsy();
      expect(wrapper.find('[data-test-subj="stepAboutDetailsNoteContent"]').exists()).toBeFalsy();
      expect(wrapper.find('[data-test-subj="stepAboutDetailsSetupContent"]').exists()).toBeFalsy();
      expect(wrapper.find('[data-test-subj="stepAboutDetailsContent"]').exists()).toBeTruthy();
    });
  });

  describe('note value does exist', () => {
    test('it renders toggle buttons, defaulted to "details"', () => {
      const wrapper = mount(
        <ThemeProvider theme={mockTheme}>
          <StepAboutRuleToggleDetails
            loading={false}
            stepDataDetails={{
              note: stepDataMock.note,
              description: stepDataMock.description,
              setup: '',
            }}
            stepData={stepDataMock}
            rule={mockRule('mocked-rule-id')}
          />
        </ThemeProvider>
      );

      expect(wrapper.find(EuiButtonGroup).exists()).toBeTruthy();
      expect(wrapper.find('#details').at(0).prop('isSelected')).toBeTruthy();
      expect(wrapper.find('#notes').at(0).prop('isSelected')).toBeFalsy();
    });

    test('it allows users to toggle between "details" and "note"', () => {
      const wrapper = mount(
        <ThemeProvider theme={mockTheme}>
          <StepAboutRuleToggleDetails
            loading={false}
            stepDataDetails={{
              note: stepDataMock.note,
              description: stepDataMock.description,
              setup: '',
            }}
            stepData={stepDataMock}
            rule={mockRule('mocked-rule-id')}
          />
        </ThemeProvider>
      );

      expect(wrapper.find('[idSelected="details"]').exists()).toBeTruthy();
      expect(wrapper.find('[idSelected="notes"]').exists()).toBeFalsy();

      wrapper.find('button[title="Investigation guide"]').simulate('click');

      expect(wrapper.find('[idSelected="details"]').exists()).toBeFalsy();
      expect(wrapper.find('[idSelected="notes"]').exists()).toBeTruthy();
    });

    test('it displays notes markdown when user toggles to "notes"', () => {
      const wrapper = mount(
        <ThemeProvider theme={mockTheme}>
          <StepAboutRuleToggleDetails
            loading={false}
            stepDataDetails={{
              note: stepDataMock.note,
              description: stepDataMock.description,
              setup: '',
            }}
            stepData={stepDataMock}
            rule={mockRule('mocked-rule-id')}
          />
        </ThemeProvider>
      );

      wrapper.find('button[title="Investigation guide"]').simulate('click');

      expect(wrapper.find('EuiButtonGroup[idSelected="notes"]').exists()).toBeTruthy();
      expect(wrapper.find('div.euiMarkdownFormat').text()).toEqual(
        'this is some markdown documentation'
      );
    });
  });

  describe('setup value is empty string', () => {
    test('it does render toggle buttons if note is not empty', () => {
      const wrapper = mount(
        <ThemeProvider theme={mockTheme}>
          <StepAboutRuleToggleDetails
            loading={false}
            stepDataDetails={{
              note: stepDataMock.note,
              description: stepDataMock.description,
              setup: '',
            }}
            stepData={stepDataMock}
            rule={mockRule('mocked-rule-id')}
          />
        </ThemeProvider>
      );

      expect(wrapper.find(EuiButtonGroup).exists()).toBeTruthy();
      expect(wrapper.find('#details').at(0).prop('isSelected')).toBeTruthy();
      expect(wrapper.find('#notes').at(0).prop('isSelected')).toBeFalsy();
      expect(wrapper.find('[data-test-subj="stepAboutDetailsSetupContent"]').exists()).toBeFalsy();
    });
  });

  describe('setup value does exist', () => {
    test('it renders toggle buttons, defaulted to "details"', () => {
      const wrapper = mount(
        <ThemeProvider theme={mockTheme}>
          <StepAboutRuleToggleDetails
            loading={false}
            stepDataDetails={{
              note: stepDataMock.note,
              description: stepDataMock.description,
              setup: stepDataMock.note, // TODO: Update to mockRule.setup once supported in UI (and mock can be updated)
            }}
            stepData={stepDataMock}
            rule={mockRule('mocked-rule-id')}
          />
        </ThemeProvider>
      );

      expect(wrapper.find(EuiButtonGroup).exists()).toBeTruthy();
      expect(wrapper.find('#details').at(0).prop('isSelected')).toBeTruthy();
      expect(wrapper.find('#notes').at(0).prop('isSelected')).toBeFalsy();
      expect(wrapper.find('#setup').at(0).prop('isSelected')).toBeFalsy();
    });

    test('it allows users to toggle between "details" and "setup"', () => {
      const wrapper = mount(
        <ThemeProvider theme={mockTheme}>
          <StepAboutRuleToggleDetails
            loading={false}
            stepDataDetails={{
              note: stepDataMock.note,
              description: stepDataMock.description,
              setup: stepDataMock.note, // TODO: Update to mockRule.setup once supported in UI (and mock can be updated)
            }}
            stepData={stepDataMock}
            rule={mockRule('mocked-rule-id')}
          />
        </ThemeProvider>
      );

      expect(wrapper.find('[idSelected="details"]').exists()).toBeTruthy();
      expect(wrapper.find('[idSelected="notes"]').exists()).toBeFalsy();
      expect(wrapper.find('[idSelected="setup"]').exists()).toBeFalsy();

      wrapper.find('button[title="Setup guide"]').simulate('click');

      expect(wrapper.find('[idSelected="details"]').exists()).toBeFalsy();
      expect(wrapper.find('[idSelected="notes"]').exists()).toBeFalsy();
      expect(wrapper.find('[idSelected="setup"]').exists()).toBeTruthy();
    });

    test('it displays notes markdown when user toggles to "setup"', () => {
      const wrapper = mount(
        <ThemeProvider theme={mockTheme}>
          <StepAboutRuleToggleDetails
            loading={false}
            stepDataDetails={{
              note: stepDataMock.note,
              description: stepDataMock.description,
              setup: stepDataMock.note, // TODO: Update to mockRule.setup once supported in UI (and mock can be updated)
            }}
            stepData={stepDataMock}
            rule={mockRule('mocked-rule-id')}
          />
        </ThemeProvider>
      );

      wrapper.find('button[title="Setup guide"]').simulate('click');

      expect(wrapper.find('EuiButtonGroup[idSelected="setup"]').exists()).toBeTruthy();
      expect(wrapper.find('div.euiMarkdownFormat').text()).toEqual(
        'this is some markdown documentation'
      );
    });
  });
});
