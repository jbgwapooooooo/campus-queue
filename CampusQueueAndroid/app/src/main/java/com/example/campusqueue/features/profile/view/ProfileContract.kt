package com.example.campusqueue.features.profile.view

import com.example.campusqueue.base.BasePresenter
import com.example.campusqueue.base.BaseView

/**
 * VERTICAL SLICE: Profile View Feature
 * MVP Contract binding ProfileActivity and ProfilePresenter
 */
interface ProfileContract {
    /** The View — implemented by ProfileActivity */
    interface View : BaseView<Presenter> {
        fun onProfileLoaded(name: String, email: String, memberSince: String, totalQueues: String, avatarBase64: String?)
    }
    /** The Presenter — implemented by ProfilePresenter */
    interface Presenter : BasePresenter {
        fun fetchProfile()
    }
}
