package com.example.campusqueue.features.admin.dashboard

import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.QueueEntry
import com.example.campusqueue.network.models.QueueStatusUpdateRequest
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class AdminDashboardPresenter(private var view: AdminDashboardContract.View?) : AdminDashboardContract.Presenter {

    private var handler: android.os.Handler? = null
    private val pollingRunnable = object : Runnable {
        override fun run() {
            fetchDashboardData() // Silent fetch
            handler?.postDelayed(this, 5000)
        }
    }

    override fun fetchDashboard() {
        view?.showLoading()
        fetchDashboardData()
        startPolling()
    }

    private fun startPolling() {
        if (handler == null) {
            handler = android.os.Handler(android.os.Looper.getMainLooper())
        }
        handler?.removeCallbacks(pollingRunnable)
        handler?.postDelayed(pollingRunnable, 5000)
    }

    private fun fetchDashboardData() {
        RetrofitClient.instance.getAllQueueEntries().enqueue(object : Callback<List<QueueEntry>> {
            override fun onResponse(call: Call<List<QueueEntry>>, response: Response<List<QueueEntry>>) {
                view?.hideLoading()
                if (response.isSuccessful) {
                    val entries = response.body() ?: emptyList()
                    view?.onQueueEntriesLoaded(entries)
                } else {
                    if (response.code() == 401) view?.onUnauthorized()
                }
            }

            override fun onFailure(call: Call<List<QueueEntry>>, t: Throwable) {
                view?.hideLoading()
            }
        })
    }

    override fun callUser(entryId: String) {
        view?.showLoading()
        val updateReq = QueueStatusUpdateRequest("called")
        RetrofitClient.instance.updateQueueStatus("eq.$entryId", updateReq).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    view?.onActionSuccess("Called student")
                    fetchDashboardData()
                } else {
                    view?.hideLoading()
                    view?.showError("Failed to call student")
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                view?.hideLoading()
                view?.showError("Network Error calling student")
            }
        })
    }

    override fun resolveUser(entryId: String) {
        view?.showLoading()
        val updateReq = QueueStatusUpdateRequest("resolved")
        RetrofitClient.instance.updateQueueStatus("eq.$entryId", updateReq).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    view?.onActionSuccess("Resolved student")
                    fetchDashboardData()
                } else {
                    view?.hideLoading()
                    view?.showError("Failed to resolve student")
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                view?.hideLoading()
                view?.showError("Network Error resolving student")
            }
        })
    }

    override fun onDestroy() {
        handler?.removeCallbacks(pollingRunnable)
        handler = null
        view = null
    }
}
