/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { Action } from '@kbn/ui-actions-plugin/public';

import { getDnsTopDomainsLensAttributes } from './lens_attributes/network/dns_top_domains';
import { VisualizationActions } from './actions';
import {
  createSecuritySolutionStorageMock,
  kibanaObservable,
  mockGlobalState,
  SUB_PLUGINS_REDUCER,
  TestProviders,
} from '../../mock';
import type { State } from '../../store';
import { createStore } from '../../store';
import type { UpdateQueryParams } from '../../store/inputs/helpers';
import { upsertQuery } from '../../store/inputs/helpers';
import { cloneDeep } from 'lodash';
import { useKibana } from '../../lib/kibana/kibana_react';
import { CASES_FEATURE_ID } from '../../../../common/constants';
import { mockCasesContract } from '@kbn/cases-plugin/public/mocks';
import { allCasesCapabilities, allCasesPermissions } from '../../../cases_test_utils';
import { InputsModelId } from '../../store/inputs/constants';
import type { VisualizationActionsProps } from './types';
import * as useLensAttributesModule from './use_lens_attributes';
import { SourcererScopeName } from '../../store/sourcerer/model';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useLocation: jest.fn(() => {
      return { pathname: 'network' };
    }),
  };
});
jest.mock('../../lib/kibana/kibana_react');
jest.mock('../../utils/route/use_route_spy', () => {
  return {
    useRouteSpy: jest.fn(() => [{ pageName: 'network', detailName: '', tabName: 'dns' }]),
  };
});

describe('VisualizationActions', () => {
  const refetch = jest.fn();
  const state: State = mockGlobalState;
  const { storage } = createSecuritySolutionStorageMock();
  const newQuery: UpdateQueryParams = {
    inputId: InputsModelId.global,
    id: 'networkDnsHistogramQuery',
    inspect: {
      dsl: ['mockDsl'],
      response: ['mockResponse'],
    },
    loading: false,
    refetch,
    state: state.inputs,
  };
  const spyUseLensAttributes = jest.spyOn(useLensAttributesModule, 'useLensAttributes');

  let store = createStore(state, SUB_PLUGINS_REDUCER, kibanaObservable, storage);
  const props: VisualizationActionsProps = {
    getLensAttributes: getDnsTopDomainsLensAttributes,
    queryId: 'networkDnsHistogramQuery',
    timerange: {
      from: '2022-03-06T16:00:00.000Z',
      to: '2022-03-07T15:59:59.999Z',
    },
    title: 'mock networkDnsHistogram',
    extraOptions: { dnsIsPtrIncluded: true },
    stackByField: 'dns.question.registered_domain',
  };
  const mockNavigateToPrefilledEditor = jest.fn();
  const mockGetCreateCaseFlyoutOpen = jest.fn();
  const mockGetAllCasesSelectorModalOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const cases = mockCasesContract();
    cases.helpers.getUICapabilities.mockReturnValue(allCasesPermissions());

    (useKibana as jest.Mock).mockReturnValue({
      services: {
        lens: {
          canUseEditor: jest.fn(() => true),
          navigateToPrefilledEditor: mockNavigateToPrefilledEditor,
        },
        cases: {
          ...mockCasesContract(),
          hooks: {
            useCasesAddToExistingCaseModal: jest
              .fn()
              .mockReturnValue({ open: mockGetAllCasesSelectorModalOpen }),
            useCasesAddToNewCaseFlyout: jest
              .fn()
              .mockReturnValue({ open: mockGetCreateCaseFlyoutOpen }),
          },
          helpers: { canUseCases: jest.fn().mockReturnValue(allCasesPermissions()) },
        },
        application: {
          capabilities: { [CASES_FEATURE_ID]: allCasesCapabilities() },
          getUrlForApp: jest.fn(),
          navigateToApp: jest.fn(),
        },
        notifications: {
          toasts: {
            addError: jest.fn(),
            addSuccess: jest.fn(),
            addWarning: jest.fn(),
            remove: jest.fn(),
          },
        },
        http: jest.fn(),
        data: {
          search: jest.fn(),
        },
        storage: {
          set: jest.fn(),
        },
        theme: {},
      },
    });
    const myState = cloneDeep(state);
    myState.inputs = upsertQuery(newQuery);
    store = createStore(myState, SUB_PLUGINS_REDUCER, kibanaObservable, storage);
  });

  test('Should generate attributes', () => {
    render(
      <TestProviders store={store}>
        <VisualizationActions {...props} />
      </TestProviders>
    );
    expect(spyUseLensAttributes.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        applyGlobalQueriesAndFilters: true,
        extraOptions: props.extraOptions,
        getLensAttributes: props.getLensAttributes,
        lensAttributes: props.lensAttributes,
        scopeId: SourcererScopeName.default,
        stackByField: props.stackByField,
        title: '',
      })
    );
  });

  test('Should render VisualizationActions button', () => {
    const { container } = render(
      <TestProviders store={store}>
        <VisualizationActions {...props} />
      </TestProviders>
    );
    expect(
      container.querySelector(`[data-test-subj="stat-networkDnsHistogramQuery"]`)
    ).toBeInTheDocument();
  });

  test('Should render Open in Lens button', () => {
    const { container } = render(
      <TestProviders store={store}>
        <VisualizationActions {...props} />
      </TestProviders>
    );
    fireEvent.click(container.querySelector(`[data-test-subj="stat-networkDnsHistogramQuery"]`)!);

    expect(screen.getByText('Open in Lens')).toBeInTheDocument();
    expect(screen.getByText('Open in Lens')).not.toBeDisabled();
  });

  test('Should call NavigateToPrefilledEditor when Open in Lens', () => {
    const { container } = render(
      <TestProviders store={store}>
        <VisualizationActions {...props} />
      </TestProviders>
    );
    fireEvent.click(container.querySelector(`[data-test-subj="stat-networkDnsHistogramQuery"]`)!);

    fireEvent.click(screen.getByText('Open in Lens'));
    expect(mockNavigateToPrefilledEditor.mock.calls[0][0].timeRange).toEqual(props.timerange);
    expect(mockNavigateToPrefilledEditor.mock.calls[0][0].attributes.title).toEqual('');
    expect(mockNavigateToPrefilledEditor.mock.calls[0][0].attributes.references).toEqual([
      {
        id: 'security-solution',
        name: 'indexpattern-datasource-layer-b1c3efc6-c886-4fba-978f-3b6bb5e7948a',
        type: 'index-pattern',
      },
    ]);
    expect(mockNavigateToPrefilledEditor.mock.calls[0][1].openInNewTab).toEqual(true);
  });

  test('Should render Inspect button', () => {
    const { container } = render(
      <TestProviders store={store}>
        <VisualizationActions {...props} />
      </TestProviders>
    );
    fireEvent.click(container.querySelector(`[data-test-subj="stat-networkDnsHistogramQuery"]`)!);

    expect(screen.getByText('Inspect')).toBeInTheDocument();
    expect(screen.getByText('Inspect')).not.toBeDisabled();
  });

  test('Should render Inspect Modal after clicking the inspect button', () => {
    const { baseElement, container } = render(
      <TestProviders store={store}>
        <VisualizationActions {...props} />
      </TestProviders>
    );
    fireEvent.click(container.querySelector(`[data-test-subj="stat-networkDnsHistogramQuery"]`)!);

    expect(screen.getByText('Inspect')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Inspect'));
    expect(
      baseElement.querySelector('[data-test-subj="modal-inspect-euiModal"]')
    ).toBeInTheDocument();
  });

  test('Should render Add to new case button', () => {
    const { container } = render(
      <TestProviders store={store}>
        <VisualizationActions {...props} />
      </TestProviders>
    );
    fireEvent.click(container.querySelector(`[data-test-subj="stat-networkDnsHistogramQuery"]`)!);

    expect(screen.getByText('Add to new case')).toBeInTheDocument();
    expect(screen.getByText('Add to new case')).not.toBeDisabled();
  });

  test('Should render Add to new case modal after clicking on Add to new case button', () => {
    const { container } = render(
      <TestProviders store={store}>
        <VisualizationActions {...props} />
      </TestProviders>
    );
    fireEvent.click(container.querySelector(`[data-test-subj="stat-networkDnsHistogramQuery"]`)!);
    fireEvent.click(screen.getByText('Add to new case'));

    expect(mockGetCreateCaseFlyoutOpen).toBeCalled();
  });

  test('Should render Add to existing case button', () => {
    const { container } = render(
      <TestProviders store={store}>
        <VisualizationActions {...props} />
      </TestProviders>
    );
    fireEvent.click(container.querySelector(`[data-test-subj="stat-networkDnsHistogramQuery"]`)!);

    expect(screen.getByText('Add to existing case')).toBeInTheDocument();
    expect(screen.getByText('Add to existing case')).not.toBeDisabled();
  });

  test('Should render Add to existing case modal after clicking on Add to existing case button', () => {
    const { container } = render(
      <TestProviders store={store}>
        <VisualizationActions {...props} />
      </TestProviders>
    );
    fireEvent.click(container.querySelector(`[data-test-subj="stat-networkDnsHistogramQuery"]`)!);
    fireEvent.click(screen.getByText('Add to existing case'));

    expect(mockGetAllCasesSelectorModalOpen).toBeCalled();
  });

  test('Should not render default actions when withDefaultActions = false', () => {
    const testProps = { ...props, withDefaultActions: false };
    render(
      <TestProviders store={store}>
        <VisualizationActions {...testProps} />
      </TestProviders>
    );

    expect(
      screen.queryByTestId(`[data-test-subj="stat-networkDnsHistogramQuery"]`)
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Inspect')).not.toBeInTheDocument();
    expect(screen.queryByText('Add to new case')).not.toBeInTheDocument();
    expect(screen.queryByText('Add to existing case')).not.toBeInTheDocument();
    expect(screen.queryByText('Open in Lens')).not.toBeInTheDocument();
  });

  test('Should render extra actions when extraAction is provided', () => {
    const testProps = {
      ...props,
      extraActions: [
        {
          getIconType: () => 'reset',
          id: 'resetField',
          execute: jest.fn(),
          getDisplayName: () => 'Reset Field',
        } as unknown as Action<object>,
      ],
    };
    const { container } = render(
      <TestProviders store={store}>
        <VisualizationActions {...testProps} />
      </TestProviders>
    );

    fireEvent.click(container.querySelector(`[data-test-subj="stat-networkDnsHistogramQuery"]`)!);
    expect(screen.getByText('Reset Field')).toBeInTheDocument();
  });
});
