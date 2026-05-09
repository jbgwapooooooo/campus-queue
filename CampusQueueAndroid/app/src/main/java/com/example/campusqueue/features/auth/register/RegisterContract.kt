package com.example.campusqueue.features.auth.register
import com.example.campusqueue.base.BasePresenter
import com.example.campusqueue.base.BaseView

interface RegisterContract {
    interface View : BaseView<Presenter> {
        fun onRegisterSuccess()
    }
    interface Presenter : BasePresenter {
        fun register(email: String, password: String, name: String)
    }
}
