package com.example.campusqueue.features.dashboard

import com.example.campusqueue.base.BasePresenter
import com.example.campusqueue.base.BaseView
import com.example.campusqueue.network.models.QueueEntry
import com.example.campusqueue.network.models.Service

/**
 * VERTICAL SLICE: Dashboard Feature
 * MVP Contract binding the View (DashboardActivity) and Presenter (DashboardPresenter)
 */
interface DashboardContract {
    /** The View — implemented by DashboardActivity */
    interface View : BaseView<Presenter> {
        fun onUnauthorized()
        fun onServicesLoaded(services: List<Service>)
        fun onActiveQueueLoaded(queueEntry: QueueEntry?)
        fun onQueueJoined()
    }
    /** The Presenter — implemented by DashboardPresenter */
    interface Presenter : BasePresenter {
        fun fetchDashboard()
        fun joinQueue(serviceId: Int, currentQueueCount: Int)
    }
}
