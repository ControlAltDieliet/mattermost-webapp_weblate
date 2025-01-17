// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import configureStore from 'redux-mock-store';
import {Provider} from 'react-redux';

import {shallow} from 'enzyme';

import thunk from 'redux-thunk';

import {CloudProducts} from 'utils/constants';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import RadioGroup from 'components/common/radio_group';

import InviteAs, {InviteType} from './invite_as';

jest.mock('mattermost-redux/selectors/entities/users', () => ({
    ...jest.requireActual('mattermost-redux/selectors/entities/users') as typeof import('mattermost-redux/selectors/entities/users'),
    isCurrentUserSystemAdmin: () => true,
}));

describe('components/cloud_start_trial_btn/cloud_start_trial_btn', () => {
    const THIRTY_DAYS = (60 * 60 * 24 * 30 * 1000); // in milliseconds
    const subscriptionCreateAt = Date.now();
    const subscriptionEndAt = subscriptionCreateAt + THIRTY_DAYS;

    const props = {
        setInviteAs: jest.fn(),
        inviteType: InviteType.MEMBER,
        titleClass: 'title',
    };

    const state = {
        entities: {
            general: {
                license: {
                    IsLicensed: 'true',
                    Cloud: 'true',
                },
            },
            cloud: {
                subscription: {
                    is_free_trial: 'false',
                    trial_end_at: 0,
                },
            },
            users: {
                currentUserId: 'uid',
                profiles: {
                    uid: {},
                },
            },
        },
    };

    const mockStore = configureStore([thunk]);
    const store = mockStore(state);

    test('should match snapshot', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <InviteAs {...props}/>
            </Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('shows the radio buttons', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteAs {...props}/>
            </Provider>,
        );
        expect(wrapper.find(RadioGroup).length).toBe(1);
    });

    test('guest radio-button is disabled and shows the badge guest restricted feature to invite guest when is NOT free trial', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'false',
                        Cloud: 'true',
                        SkuShortName: CloudProducts.STARTER,
                    },
                },
                cloud: {
                    subscription: {
                        is_free_trial: 'false',
                        trial_end_at: 0,
                        sku: CloudProducts.STARTER,
                        product_id: 'cloud-starter-id',
                    },
                    products: {
                        'cloud-starter-id': {
                            sku: CloudProducts.STARTER,
                        },
                    },
                },
                users: {
                    currentUserId: 'uid',
                    profiles: {
                        current_user_id: {roles: 'system_admin'},
                    },
                },
            },
        };
        const store = mockStore(state);
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteAs {...props}/>
            </Provider>,
        );

        const guestRadioButton = wrapper.find('input[value="GUEST"]');
        expect(guestRadioButton.props().disabled).toBe(true);

        const badgeText = wrapper.find('.Badge span.badge-text').text();
        expect(badgeText).toBe('Professional feature- try it out free');
    });

    test('shows the badge guest highligh feature to invite guest when IS FREE trial', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'false',
                        Cloud: 'true',
                        SkuShortName: CloudProducts.STARTER,
                    },
                },
                cloud: {
                    subscription: {
                        is_free_trial: 'true',
                        trial_end_at: subscriptionEndAt,
                    },
                },
                users: {
                    currentUserId: 'uid',
                    profiles: {
                        current_user_id: {roles: 'system_admin'},
                    },
                },
            },
        };
        const store = mockStore(state);
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteAs {...props}/>
            </Provider>,
        );

        const guestRadioButton = wrapper.find('input[value="GUEST"]');
        expect(guestRadioButton.props().disabled).toBe(false);

        const badgeText = wrapper.find('.Badge span.badge-text').text();
        expect(badgeText).toBe('Professional feature');
    });
});
