package com.example.campusqueue.features.profile.update

import com.example.campusqueue.base.BasePresenter
import com.example.campusqueue.base.BaseView

/**
 * VERTICAL SLICE: Profile Edit Feature
 * MVP Contract binding UpdateProfileActivity and UpdateProfilePresenter
 */
interface UpdateProfileContract {
    /** The View — implemented by UpdateProfileActivity */
    interface View : BaseView<Presenter> {
        fun onProfileUpdated()
        fun onProfileLoaded(name: String, email: String, avatarBase64: String?)
    }
    /** The Presenter — implemented by UpdateProfilePresenter */
    interface Presenter : BasePresenter {
        fun fetchProfile()
        fun updateProfileInfo(name: String, email: String, currentPass: String, newPass: String, avatarBase64: String?)
    }
}
