package com.example.campusqueue.features.auth.login
import com.example.campusqueue.base.BasePresenter
import com.example.campusqueue.base.BaseView

interface LoginContract {
    interface View : BaseView<Presenter> {
        fun onLoginSuccess(token: String)
        fun navigateToRegister()
        fun navigateToDashboard()
    }
    interface Presenter : BasePresenter {
        fun login(email: String, password: String)
    }
}
