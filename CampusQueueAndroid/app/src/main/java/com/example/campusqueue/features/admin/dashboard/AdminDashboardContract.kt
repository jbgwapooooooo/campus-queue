package com.example.campusqueue.features.admin.dashboard

import com.example.campusqueue.base.BasePresenter
import com.example.campusqueue.base.BaseView
import com.example.campusqueue.network.models.QueueEntry

interface AdminDashboardContract {
    interface View : BaseView<Presenter> {
        fun onUnauthorized()
        fun onQueueEntriesLoaded(entries: List<QueueEntry>)
        fun onActionSuccess(message: String)
    }
    interface Presenter : BasePresenter {
        fun fetchDashboard()
        fun callUser(entryId: String)
        fun resolveUser(entryId: String)
    }
}
